import jwt from "jsonwebtoken";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { config } from "../../../config";
import { ForbiddenError, NotFoundError } from "../../../shared/error";

export class BecomeAuthorUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Only readers can be promoted to author
    // Admins/co-admins/existing authors are left unchanged
    if (user.role !== "reader") {
      // Already has sufficient role — just return a fresh token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"] }
      );
      return {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      };
    }

    // Promote reader → author
    const updated = await this.userRepository.update(userId, { role: "author" });

    const token = jwt.sign(
      { id: updated.id, email: updated.email, name: updated.name, role: updated.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"] }
    );

    return {
      token,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
      },
    };
  }
}
