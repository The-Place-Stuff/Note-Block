require('dotenv').config()

import { Client, GatewayIntentBits, Collection, Interaction, ChatInputCommandInteraction, ActivityType, TextChannel, Message } from 'discord.js'
import { Voice } from "./types/basic";
import { readdirSync, createWriteStream, readFileSync } from 'fs'
import { TTSProcessor } from './data/ttsProcessor'
import { AudioService, SlashCommand } from './types/basic'
import { get } from 'https'
import { Data } from './data/utils/DataUtils'
import { VoiceUtils } from './data/utils/VoiceUtils'
import { join } from 'path'

const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
})

//#region Command Execution Logic
const clientCommands: Collection<string, SlashCommand> = new Collection()
export const audioServices: Collection<string, AudioService> = new Collection()
export const rootDir = __dirname

async function registerCommands() {
    const commandFiles: string[] = readdirSync('./commands').filter(file =>
        file.endsWith('.ts' || '.js')
    )

    for (const file of commandFiles) {
        const Command = (await import(`./commands/${file}`)).default

        const command: SlashCommand = new Command()

        clientCommands.set(command.data.name, command)
    }
}

async function registerServices() {
    const files: string[] = readdirSync('./data/exporter').filter(file => file.endsWith('.ts' || '.js'))

    for (const file of files) {
        const Service = (await import(`./data/exporter/${file}`)).default
        const registeredService: AudioService = new Service()
        audioServices.set(registeredService.id, registeredService)
    }
}

registerCommands()
registerServices()

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand()) return

    const command: SlashCommand = clientCommands.get(
        interaction.commandName
    ) as SlashCommand

    if (!command) return

    try {
        command.execute(interaction as ChatInputCommandInteraction, client)
    } catch (error) {
        console.error(error)
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        })
    }
})

//#endregion

//#region Login
client.login(process.env.TOKEN)

client.on('ready', async () => {
    client.user?.setActivity('with Roosey!', { type: ActivityType.Playing })

    // Builds all voices
    VoiceUtils.buildVoices()

    //Initialize the TTSProcessor
    new TTSProcessor(client)

    // Other

    //Fetch latest NB Data
    const dataMessage: Message = await (client.channels.cache.get('1117203482663976960') as TextChannel).messages.fetch('1247211751062110299') as Message

    Data.dataFile = JSON.parse(dataMessage.content)

    // Clear slow voices - ideally this is removed in the future when the queue is improved
    Data.dataFile.forEach(user => {
        const voice: Voice = VoiceUtils.getVoice(user.voice)
        if (voice && voice.service == 'FAKEYOU') {
            user.voice = 'none'
        }
    })

    console.log('Notey Poo is online!')
})

//#endregion