import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

export type MagazineStatus = "draft" | "published" | "suggestions_pending";

@Entity("magazines")
export class Magazine {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  coverImage?: string;

  @Column({ type: "text" })
  content!: string;

  @Column({
    type: "enum",
    enum: ["draft", "published", "suggestions_pending"],
    default: "published",
  })
  status!: MagazineStatus;

  @Column({ nullable: true })
  createdById?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "createdById" })
  createdBy?: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
