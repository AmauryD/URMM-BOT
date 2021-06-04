import {
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
} from "typeorm";
import { Poll } from "./poll";
import { TourMessage } from "./tour-message";
import { VoteProposition } from "./vote-proposition";

export enum TourType {
  Multiple = "multiple",
  Single = "single",
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
    onDelete: "CASCADE",
  })
  public poll!: Poll;

  @OneToMany(() => VoteProposition, (vote) => vote.tour)
  public votePropositions!: VoteProposition[];

  @Column("enum", {
    enum: TourType,
    default: TourType.Multiple,
  })
  public type!: TourType;

  @OneToMany(() => TourMessage, (tourMessage) => tourMessage.tour)
  public tourMessages!: TourMessage[];

  @Column("bool", {
    default: false,
    nullable: false,
  })
  public isFinal!: boolean;

  @CreateDateColumn()
  public createdAt!: any;
}
