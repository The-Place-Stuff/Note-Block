import { Client, TextChannel } from "discord.js";
import { User, UserBase } from "../../types/basic";
import { writeFileSync } from "fs";
import { join } from "path";

export class Data {
    public static dataFile: UserBase

    public static async saveData(client: Client) {
        writeFileSync(join(__dirname, '../../data.json'), JSON.stringify(Data.dataFile, null, 4))

        //console.log(Data.dataFile)

        const dataChannel: TextChannel = client.channels.cache.get('1117203482663976960') as TextChannel

        dataChannel.send({
            content: 'This is a Noteblock data file. Deleting this message will result in corruption of the current stored data file. Only delete this message if you know what you are doing.',
            files: [join(__dirname, '../../data.json')]
        })
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