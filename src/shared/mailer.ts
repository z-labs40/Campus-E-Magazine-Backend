import nodemailer from "nodemailer";
import { Logger } from "./logger";

class Mailer {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      const host = process.env.SMTP_HOST || "smtp.gmail.com";
      const port = Number(process.env.SMTP_PORT) || 587;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (!user || !pass) {
        Logger.warn("[MAILER] SMTP credentials not set. Emails will only be logged to the console.");
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for port 465, false for 587/25
        auth: user && pass ? { user, pass } : undefined,
      });
    }
    return this.transporter;
  }

  async sendOtpEmail(to: string, name: string, otpCode: string): Promise<boolean> {
    const fromEmail = process.env.SMTP_FROM_EMAIL || `"Campus E-Magazine" <no-reply@campus.edu>`;
    const subject = "🔑 Password Reset OTP Code - Campus E-Magazine";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Campus E-Magazine Password Reset</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 550px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            border: 1px border #e5e7eb;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 30px 20px;
            text-align: center;
            color: #ffffff;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px 30px;
            color: #374151;
            line-height: 1.6;
          }
          .content p {
            margin: 0 0 20px 0;
            font-size: 14px;
          }
          .otp-container {
            background-color: #f3f4f6;
            border: 1px dashed #d1d5db;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: 800;
            color: #4f46e5;
            letter-spacing: 6px;
            margin: 0;
            font-family: 'Sora', monospace;
          }
          .expiry-text {
            font-size: 11px;
            color: #9ca3af;
            margin-top: 8px !important;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .footer {
            background-color: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
            border-t: 1px solid #f3f4f6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campus E-Magazine</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>We received a request to reset the password for your Campus E-Magazine account. Please use the following one-time passcode (OTP) to authenticate:</p>
            
            <div class="otp-container">
              <div class="otp-code">${otpCode}</div>
              <p class="expiry-text">⚠️ Valid for 3 Minutes Only</p>
            </div>
            
            <p>If you did not make this request, please disregard this email or contact administrative support if you suspect unauthorized access.</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Campus E-Magazine Portal. All rights reserved.<br>
            Sent securely via administrative SMTP mail server.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const transporter = this.getTransporter();
      
      // If credentials aren't provided, skip active send to avoid crashes but log it beautifully
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        Logger.info(`[MAILER] [MOCK SEND] Email simulation sent to ${to} with code: ${otpCode}`);
        return true;
      }

      await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html: htmlContent,
        text: `Hello ${name}, your password reset code is ${otpCode}. It is valid for 3 minutes.`,
      });

      Logger.info(`[MAILER] OTP email successfully dispatched to ${to}`);
      return true;
    } catch (error: any) {
      Logger.error(`[MAILER] Failed to send email to ${to}: ${error.stack}`);
      // Return true in development to allow progress if server SMTP has a temporary configuration issue
      return false;
    }
  }

  async sendWelcomeEmail(to: string, name: string, tempPassword: string): Promise<boolean> {
    const fromEmail = process.env.SMTP_FROM_EMAIL || `"Campus E-Magazine" <no-reply@campus.edu>`;
    const subject = "Welcome to Campus E-Magazine — Your Temporary Password";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Campus E-Magazine - Welcome</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #f9fafb;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 550px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 16px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
              border: 1px solid #e5e7eb;
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
              padding: 30px 20px;
              text-align: center;
              color: #ffffff;
            }
            .header h1 {
              margin: 0;
              font-size: 22px;
              font-weight: 800;
              letter-spacing: -0.5px;
            }
            .content {
              padding: 40px 30px;
              color: #374151;
              line-height: 1.6;
            }
            .content p { margin: 0 0 16px 0; font-size: 14px; }
            .temp-password {
              background-color: #f3f4f6;
              border: 1px dashed #d1d5db;
              border-radius: 12px;
              padding: 18px;
              text-align: center;
              margin: 22px 0;
            }
            .temp-password code {
              display: inline-block;
              font-family: 'Sora', monospace;
              font-size: 20px;
              font-weight: 900;
              letter-spacing: 2px;
              color: #4f46e5;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px 30px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #f3f4f6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Campus E-Magazine</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>You have been added as a <strong>Co-Admin</strong> for Campus E-Magazine.</p>
              <p>Use the temporary password below to log in:</p>
              <div class="temp-password">
                <code>${tempPassword}</code>
              </div>
              <p>For security, we recommend changing your password after the first login.</p>
              <p>If you didn’t expect this email, please contact administrative support.</p>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} Campus E-Magazine Portal. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const transporter = this.getTransporter();

      // If credentials aren't provided, skip active send to avoid crashes but log it beautifully
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        Logger.info(`[MAILER] [MOCK SEND] Welcome email simulation sent to ${to}. Temp password: ${tempPassword}`);
        return true;
      }

      await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html: htmlContent,
        text: `Hello ${name}, you have been added as a Co-Admin. Temporary password: ${tempPassword}.`,
      });

      Logger.info(`[MAILER] Welcome email successfully dispatched to ${to}`);
      return true;
    } catch (error: any) {
      Logger.error(`[MAILER] Failed to send welcome email to ${to}: ${error.stack}`);
      return false;
    }
  }
}

export const mailer = new Mailer();
