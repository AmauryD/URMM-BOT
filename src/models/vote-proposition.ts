import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
} from "typeorm";
import { Proposition } from "./proposition";
import { Tour } from "./tour";
import { Vote } from "./vote";

@Entity()
@Unique("tour_proposition", ["proposition", "tour"])
export class VoteProposition {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @OneToMany(() => Vote, (vote) => vote.voteProposition)
  public votes!: Vote[];

  @ManyToOne(() => Proposition, (prop) => prop.votePropositions, {
    nullable: false,
    onDelete: "CASCADE",
  })
  public proposition!: Proposition;

  @ManyToOne(() => Tour, (tour) => tour.votePropositions, {
    nullable: false,
    onDelete: "CASCADE",
  })
  public tour!: Tour;

  @CreateDateColumn()
  public createdAt!: any;
}
