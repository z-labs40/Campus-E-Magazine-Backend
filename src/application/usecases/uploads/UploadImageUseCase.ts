import https from "https";
import crypto from "crypto";
import { BadRequestError } from "../../../shared/error";

export class UploadImageUseCase {
  async execute(params: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder?: string;
  }): Promise<{ url: string; publicId?: string }> {
    const { buffer, originalName, mimeType, folder = "uploads" } = params;

    if (!mimeType?.startsWith("image/")) {
      throw new BadRequestError("Only image uploads are allowed.");
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestError(
        "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
      );
    }

    const uploadFolder = folder ?? "uploads";
    const timestamp = Math.round(Date.now() / 1000).toString();

    // Build the signature string: all upload params sorted alphabetically
    const paramsToSign: Record<string, string> = {
      folder: uploadFolder,
      timestamp,
    };

    const signatureBase =
      Object.keys(paramsToSign)
        .sort()
        .map((key) => `${key}=${paramsToSign[key]}`)
        .join("&") + apiSecret;

    const signature = crypto
      .createHash("sha256")
      .update(signatureBase)
      .digest("hex");

    return new Promise((resolve, reject) => {
      const boundary = `----CampusE-${crypto.randomBytes(10).toString("hex")}`;
      const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const parts: Buffer[] = [];

      const pushField = (name: string, value: string) => {
        parts.push(
          Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
          )
        );
      };

      pushField("api_key", apiKey);
      pushField("timestamp", timestamp);
      pushField("signature", signature);
      pushField("folder", uploadFolder);

      // File part
      parts.push(
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${sanitizedFileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`
        )
      );
      parts.push(buffer);
      parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

      const body = Buffer.concat(parts);

      const req = https.request(
        {
          method: "POST",
          hostname: "api.cloudinary.com",
          path: `/v1_1/${cloudName}/image/upload`,
          headers: {
            "Content-Type": `multipart/form-data; boundary=${boundary}`,
            "Content-Length": body.length,
          },
        },
        (cloudRes) => {
          let data = "";
          cloudRes.on("data", (chunk) => {
            data += chunk.toString();
          });
          cloudRes.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              if (
                !cloudRes.statusCode ||
                cloudRes.statusCode < 200 ||
                cloudRes.statusCode >= 300
              ) {
                return reject(
                  new BadRequestError(
                    parsed?.error?.message || `Cloudinary error: ${data}`
                  )
                );
              }

              resolve({
                url: parsed?.secure_url as string,
                publicId: parsed?.public_id,
              });
            } catch {
              reject(
                new BadRequestError(
                  `Cloudinary upload failed (invalid response): ${data}`
                )
              );
            }
          });
        }
      );

      req.on("error", (err) => reject(err));
      req.write(body);
      req.end();
    });
  }
}
