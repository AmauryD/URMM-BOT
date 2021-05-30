import {
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";
import { BaseModel } from "./base.model";
import { GuildMember } from "./server";
import { Tour } from "./tour";

@Entity()
export class TourMessage extends BaseModel {
  @ManyToOne(() => Tour, (tour) => tour.tourMessages, {
    nullable: false,
    onDelete: "CASCADE",
  })
  public tour!: Tour;

  @ManyToOne(() => GuildMember, (server) => server.tourMessages, {
    nullable: false,
    onDelete: "CASCADE",
  })
  public server!: GuildMember;

  @Column("varchar", {
    nullable: false,
  })
  public messageId!: string;
}
