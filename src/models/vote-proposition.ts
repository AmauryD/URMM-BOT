import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Proposition } from "./proposition";
import { Tour } from "./tour";
import { Vote } from "./vote";

@Entity()
export class VoteProposition {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @OneToMany(() => Vote, (vote) => vote.voteProposition)
  public votes!: Vote[];

  @ManyToOne(() => Proposition, (prop) => prop.votePropositions, {
    nullable: false,
  })
  public proposition!: Proposition;

  @ManyToOne(() => Tour, (tour) => tour.votePropositions, {
    nullable: false,
  })
  public tour!: Tour;
}
