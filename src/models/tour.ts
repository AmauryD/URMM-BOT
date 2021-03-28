import {
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from "typeorm";
import { Poll } from "./poll";
import { VoteProposition } from "./vote-proposition";

export enum TourType {
  Multiple,
  Single,
}

@Entity()
@Unique("number_poll", ["number", "poll"])
export class Tour {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column("integer", {
    nullable: false,
  })
  public number!: number;

  @ManyToOne(() => Poll, (poll) => poll.tours, {
    nullable: false,
  })
  public poll!: Poll;

  @OneToMany(() => VoteProposition, (vote) => vote.tour)
  public votePropositions!: VoteProposition[];

  @Column("enum", {
    enum: TourType,
    default: TourType.Multiple,
  })
  public type!: TourType;

  @Column("bool", {
    default: false,
    nullable: false
  })
  public isFinal!: boolean;
}
