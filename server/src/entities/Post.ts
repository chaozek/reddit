import { ObjectType, Field, Int } from "type-graphql";
import { Column } from "typeorm/decorator/columns/Column";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { UpdateDateColumn } from "typeorm/decorator/columns/UpdateDateColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { BaseEntity, CreateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Updoot } from "./Updoot";
@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  creatorId: number;

  @Field(() => String)
  @Column()
  title!: string;

  @Field(() => String)
  @Column({ default: "" })
  text!: string;

  @Field(() => String)
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null; // 1 or -1 or null

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
