import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
  CreateDateColumn,
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

  @Column("varchar", {
    nullable: true,
  })
  public broadcastFoodChannelId!: string | null;

  @Column("boolean", {
    nullable: false,
    default: true,
  })
  public isActive!: boolean;

  @CreateDateColumn()
  public createdAt!: any;
}
