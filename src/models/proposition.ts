import {
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";
import { Poll } from "./poll";
import { VoteProposition } from "./vote-proposition";

@Entity()
export class Proposition {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column("varchar", {
    unique: true,
  })
  public name!: string;

  @OneToMany(() => VoteProposition, (prop) => prop.proposition)
  public votePropositions!: VoteProposition[];

  @OneToOne(() => Poll, (poll) => poll.winner)
  public pollWinner!: Poll;

  toString(): string {
    return this.name;
  }
}
