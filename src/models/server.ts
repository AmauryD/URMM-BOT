import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
} from "typeorm";

@Entity()
export class GuildMember {
  @PrimaryColumn("varchar")
  public guildId!: string;

  @Index()
  @Column("varchar", {
    nullable: false,
  })
  public broadcastChannelId!: string;

  @Column("boolean", {
    nullable: false,
    default: true
  })
  public isActive!: boolean;
}
