import bcrypt from "bcrypt";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { BadRequestError, NotFoundError } from "../../../shared/error";

export class ChangePasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, currentPassword: string, newPassword: string) {
    if (!currentPassword?.trim() || !newPassword?.trim()) {
      throw new BadRequestError("Current password and new password are required");
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters long");
    }

    if (currentPassword === newPassword) {
      throw new BadRequestError("New password must be different from your current password");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      throw new BadRequestError("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return {
      success: true,
      message: "Password updated successfully",
    };
  }
}
