import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export type UserRole = "reader" | "author" | "admin" | "co-admin";
export type UserStatus = "active" | "inactive";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({
    type: "enum",
    enum: ["reader", "author", "admin", "co-admin"],
    default: "reader",
  })
  role!: UserRole;

  @Column({
    type: "enum",
    enum: ["active", "inactive"],
    default: "active",
  })
  status!: UserStatus;

  @Column({ type: "varchar", nullable: true })
  otpCode?: string | null;

  @Column({ type: "timestamp", nullable: true })
  otpExpiresAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
