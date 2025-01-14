import { User as DiscordUser } from "discord.js";
import { User, UserRoles } from "../models/user";
import { getRepository } from "typeorm";

export const isAdmin = async (client : DiscordUser) => {
    const user = await getRepository(User).findOne(client.id);
    return user?.role === UserRoles.Admin;
}