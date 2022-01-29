import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { BaseModel } from "./base-model";
import { Proposition } from "./proposition";
import { Tour } from "./tour";

export enum PollStatus {
  Active = "active",
  Finished = "finished",
  Draft = "draft", // when created in test mode
  Closed = "closed",
}

@Entity()
export class Poll extends BaseModel {
  @Column("varchar", {
    nullable: false,
    unique: true,
  })
  public name!: string;

  @Column("enum", {
    enum: PollStatus,
    default: PollStatus.Active,
  })
  public status!: PollStatus;

  @OneToOne(() => Proposition, (winner) => winner.pollWinner, {
    nullable: true,
  })
  @JoinColumn()
  public winner!: Proposition | null;

  @OneToMany(() => Tour, (tour) => tour.poll)
  public tours!: Tour[];
}
