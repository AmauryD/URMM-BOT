import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

import { VoteProposition } from "./vote-proposition";

@Entity()
export class Vote {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column("varchar", {
    nullable: false,
  })
  public clientId!: string;

  @ManyToOne(() => VoteProposition, (voteProp) => voteProp.votes)
  public voteProposition!: VoteProposition;
}
