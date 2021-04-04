import {
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Poll } from "./poll";
import { VoteProposition } from "./vote-proposition";

export enum PropositionState {
  WAITING = "waiting",
  VALIDATED = "validated",
  DENIED = "denied"
}

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

  @Index()
  @Column("varchar", {
    nullable: true,
  })
  public clientId!: string;

  @CreateDateColumn()
  public createdAt!: any;

  @Column("varchar", {
    nullable: true,
  })
  public note!: string;

  @Column({
    type: "enum",
    enum: PropositionState,
    default: PropositionState.WAITING,
  })
  public state!: string;

  toString(): string {
    return this.name;
  }
}
