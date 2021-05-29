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
import { GuildMember } from "./server";
import { Tour } from "./tour";
import { VoteProposition } from "./vote-proposition";

@Entity()
export class TourMessage {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @ManyToOne(() => Tour, (tour) => tour.tourMessages, {
    nullable: true,
    onDelete: "SET NULL",
  })
  public tour?: Tour;

  @ManyToOne(() => GuildMember, (server) => server.tourMessages, {
    nullable: true,
    onDelete: "SET NULL",
  })
  public server?: GuildMember;

  @Column("varchar", {
    nullable: false,
  })
  public messageId!: string;

  @CreateDateColumn()
  public createdAt!: any;
}
