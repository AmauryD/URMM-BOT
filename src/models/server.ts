import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { TourMessage } from "./tour-message";

@Entity("guild_member")
export class DiscordServer {
  @PrimaryColumn("varchar")
  public guildId!: string;

  @Index()
  @Column("varchar", {
    nullable: false,
  })
  public broadcastChannelId!: string;

  @Column("varchar", {
    nullable: true,
  })
  public broadcastFoodChannelId?: string;

  @Column("boolean", {
    nullable: false,
    default: true,
  })
  public isActive!: boolean;

  @OneToMany(() => TourMessage, (tourMessage) => tourMessage.server)
  public tourMessages!: TourMessage[];

  @CreateDateColumn()
  public createdAt!: Date;
}
