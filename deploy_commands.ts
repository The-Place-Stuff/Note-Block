require("dotenv").config()

import { readdirSync } from "fs"
import { clientId } from "./config.json"
import { REST } from "discord.js"
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord-api-types/v10"
import { SlashCommand } from "./types/basic"
import { VoiceUtils } from "./data/utils/VoiceUtils"

const commandFiles = readdirSync("./commands").filter(file => file.endsWith(".ts" || ".js"))

let commands: RESTPostAPIApplicationCommandsJSONBody[] = []

async function registerCommands() {
  for (const file of commandFiles) {
    const Command = (await import(`./commands/${file}`)).default

    const command: SlashCommand = new Command()

    commands.push(command.data.toJSON())
  }

  const rest = new REST({ version: "9" }).setToken(process.env.TOKEN as string)

  rest.put(Routes.applicationCommands(clientId), { body: commands })
      .then(() => console.log("Successfully registered application commands."))
      .catch(console.error)
}

registerCommands()
