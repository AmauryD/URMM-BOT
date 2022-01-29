import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { TourMessage } from "./tour-message";

export enum DiscordServerType {
  DEV = "development",
  PROD = "production",
}

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

  @Column("set", {
    enum: DiscordServerType,
    default: [DiscordServerType.PROD],
  })
  public type!: DiscordServerType;

  @OneToMany(() => TourMessage, (tourMessage) => tourMessage.server)
  public tourMessages!: TourMessage[];

  @CreateDateColumn()
  public createdAt!: Date;
}
