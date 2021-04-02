import { Column, Entity, PrimaryColumn } from "typeorm";

export enum UserRoles {
    Admin = "Admin",
    User = "User"
}

@Entity()
export class User {
    @PrimaryColumn("varchar")
    public id!: string;

    @Column("enum", {
        nullable: false,
        enum: UserRoles
    })
    public role!: UserRoles;
}