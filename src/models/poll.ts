import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Proposition } from "./proposition";
import { Tour } from "./tour";

export enum PollStatus {
  Active = "active",
  Finished = "finished",
  Closed = "closed",
}

@Entity()
export class Poll {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

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

  @CreateDateColumn()
  public createdAt!: any;
}
