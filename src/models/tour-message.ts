import {
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";
import { BaseModel } from "./base.model";
import { DiscordServer } from "./server";
import { Tour } from "./tour";

@Entity()
export class TourMessage extends BaseModel {
  @ManyToOne(() => Tour, (tour) => tour.tourMessages, {
    nullable: false,
    onDelete: "CASCADE",
  })
  public tour!: Tour;

  @ManyToOne(() => DiscordServer, (server) => server.tourMessages, {
    nullable: false,
    onDelete: "CASCADE",
  })
  public server!: DiscordServer;

  @Column("varchar", {
    nullable: false,
  })
  public messageId!: string;
}
