import { Client, Message, TextChannel } from "discord.js";
import { User, UserBase } from "../../types/basic";
import { writeFileSync } from "fs";
import { join } from "path";
import * as IDConstants from "../utils/IDConstants";

export class Data {
    public static dataFile: UserBase

    public static async saveData(client: Client) {
        const dataMessage: Message = await (client.channels.cache.get(IDConstants.NOTEBLOCK_DB_CHANNEL) as TextChannel).messages.fetch(IDConstants.USER_DATABASE_MESSAGE) as Message

        dataMessage.edit(JSON.stringify(Data.dataFile))
    }

    public static writeNewUser(data: User, client: Client) {
        Data.dataFile.push(data)

        Data.saveData(client)

        return data
    }

    public static getUserData(id: string): User | undefined {
        return Data.dataFile.find((entry: User) => entry.id === id)
    }

    public static getOrCreateUser(id: string, client: Client): User {
        if (!Data.getUserData(id)) {
            return Data.writeNewUser({favorites: [], id: id, minecraft_name: false, voice: 'none'}, client)
        }
        return Data.getUserData(id) as User
    }

    public static updateUserData(data: User, client: Client) {
        const userIndex: number = Data.dataFile.findIndex((entry: User) => entry.id === data.id)

        Data.dataFile[userIndex] = data

        Data.saveData(client)
    }

    public static replaceAllData(data: UserBase, client: Client) {
        Data.dataFile = data

        Data.saveData(client)
    }
}