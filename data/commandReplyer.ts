import { readFileSync } from "fs";
import path from "path";

export class CommandReplyer {
    public static getReply(userID: string, command: string): string {
        const repliesFile = JSON.parse(readFileSync(path.join(__dirname, '../data/replies.json'), 'utf-8'))

        let replyParent

        replyParent = repliesFile[userID]

        if (!repliesFile[userID]) {
            replyParent = repliesFile['default']
        }

        return replyParent[command][this.randomNum(0, replyParent[command].length - 1)]
    }

    public static randomNum(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
}