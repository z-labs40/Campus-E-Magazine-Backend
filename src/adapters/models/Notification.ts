import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  message!: string;

  @Column({ default: "info" })
  type!: string;

  @Column({ default: false })
  read!: boolean;

  @Column({ nullable: true })
  editionId?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
