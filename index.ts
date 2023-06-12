require('dotenv').config()

import { Client, GatewayIntentBits, Collection, Interaction, ChatInputCommandInteraction, ActivityType, TextChannel } from 'discord.js'
import { readdirSync, createWriteStream } from 'fs'
import { TTSProcessor } from './data/ttsProcessor'
import { SlashCommand } from './types/basic'
import { get } from 'https'
import { Data } from './data/utils/DataUtils'
import { VoiceUtils } from './data/utils/VoiceUtils'

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

registerCommands()

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

  //Download latest NB Data
  const JSONmsg: TextChannel = client.channels.cache.get('1117203482663976960') as TextChannel

  const JSONfile: string = (await JSONmsg.messages.fetch({ limit: 1 })).first()?.attachments.first()?.url as string
  
  try {
    console.log('Downloading latest NB Data...')

    get(JSONfile, (res) => {
      const file = createWriteStream('data.json')
      res.pipe(file)
    })

    console.log('Downloaded latest NB Data!')

  } catch (error) {
    console.error(error)
  }
  console.log('Notey Poo is online!')
})

//#endregion
