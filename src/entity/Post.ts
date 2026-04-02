import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ name: "author_id" })
  authorId!: number;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "author_id" })
  author!: User;
}
