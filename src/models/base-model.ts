import { CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export class BaseModel {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @CreateDateColumn()
  public createdAt!: Date;
}
