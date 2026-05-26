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
import { Magazine } from "./Magazine";

export type SuggestionStatus = "pending" | "accepted" | "rejected";

export interface TextRange {
  start: number;
  end: number;
  selectedText?: string;
}

@Entity("suggestions")
export class Suggestion {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  editionId!: string;

  @ManyToOne(() => Magazine, { onDelete: "CASCADE" })
  @JoinColumn({ name: "editionId" })
  edition!: Magazine;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "jsonb" })
  range!: TextRange;

  @Column({ type: "text" })
  suggestion!: string;

  @Column({
    type: "enum",
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  })
  status!: SuggestionStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
