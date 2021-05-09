import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

import { VoteProposition } from "./vote-proposition";

@Entity()
@Unique(["clientId", "voteProposition"])
export class Vote {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column("varchar", {
    nullable: false,
  })
  public clientId!: string;

  @ManyToOne(() => VoteProposition, (voteProp) => voteProp.votes, {
    nullable: false,
    onDelete: "CASCADE",
  })
  public voteProposition!: VoteProposition;

  @CreateDateColumn()
  public createdAt!: any;
}
