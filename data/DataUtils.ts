import { Attachment, Client, Message, TextChannel } from "discord.js";
import { VoiceData, VoiceEntry } from "../types/basic";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export class Data {
    public static dataFile: VoiceData = JSON.parse(readFileSync(join(__dirname, '../data.json'), 'utf-8'))

    public static async saveData(client: Client) {
        writeFileSync('../data.json', JSON.stringify(this.dataFile))

        const dataChannel: TextChannel = client.channels.cache.get('1117203482663976960') as TextChannel

        dataChannel.send({
            content: 'This is a Noteblock data file. Deleting this message will result in corruption of the current stored data file. Only delete this message if you know what you are doing.',
            files: ['../data.json']
        })
    }

    public static writeNewUser(data: VoiceEntry, client: Client) {
        Data.dataFile.push(data)

        Data.saveData(client)

        return data
    }

    public static getUserData(id: string): VoiceEntry | undefined {
        return Data.dataFile.find((entry: VoiceEntry) => entry.id === id)
    }

    public static updateUserData(data: VoiceEntry, client: Client) {
        const userIndex: number = Data.dataFile.findIndex((entry: VoiceEntry) => entry.id === data.id)

        Data.dataFile[userIndex] = data

        Data.saveData(client)
    }

    public static replaceAllData(data: VoiceData, client: Client) {
        Data.dataFile = data

        Data.saveData(client)
    }
}