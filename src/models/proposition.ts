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

  toString(): string {
    return this.name;
  }
}
