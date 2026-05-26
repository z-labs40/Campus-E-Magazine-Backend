import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { config } from "../../../config";
import { UnauthorizedError } from "../../../shared/error";

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"] }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
