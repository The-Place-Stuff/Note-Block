require("dotenv").config()

import { Client, GatewayIntentBits, Collection, Interaction, ChatInputCommandInteraction, ActivityType } from "discord.js"
import { readdirSync } from "fs"
import { TTSProcessor } from "./data/ttsProcessor"
import { SlashCommand } from "./types/basic"

const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

//#region Command Execution Logic 
const clientCommands: Collection<string, SlashCommand> = new Collection()

async function registerCommands() {
    const commandFiles: string[] = readdirSync("./commands").filter(file => file.endsWith(".ts" || ".js"))

    for (const file of commandFiles) {
        const Command = (await import(`./commands/${file}`)).default
    
        const command: SlashCommand = new Command()
    
        clientCommands.set(command.data.name, command)
    }
}

registerCommands()

client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return

    const command: SlashCommand = clientCommands.get(interaction.commandName) as SlashCommand

    if (!command) return

    try {
        command.execute(interaction as ChatInputCommandInteraction, client)
    } catch (error) {
        console.error(error)
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
    }
})

//#endregion

//#region Login
client.login(process.env.TOKEN)

client.on("ready", () => {
    console.log("Notey Poo is online!")

    client.user?.setActivity("with Roosey!", { type: ActivityType.Playing })

    //Initialize the TTSProcessor
    new TTSProcessor(client)
})

//#endregion

