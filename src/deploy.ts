import "dotenv/config";
import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import AurisClient from "./structures/Client";
import Command from "./structures/Command";

const client = {} as AurisClient;
const commands: any[] = [];

const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
  const folders = fs.readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const { default: CommandClass } = require(filePath);

      if (CommandClass && CommandClass.prototype instanceof Command) {
        const command = new CommandClass(client);
        commands.push(command.data.toJSON());
      }
    }
  }
}

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
  console.error("Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in .env file.");
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log(
      `🚀 Started refreshing ${commands.length} global (/) commands...`,
    );

    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
      { body: commands },
    );

    console.log(
      `✅ Successfully reloaded ${(data as any).length} global (/) commands.`,
    );

    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error("❌ Error deploying commands:", error);
    process.exit(1);
  }
})();
