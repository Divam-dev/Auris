import fs from "fs";
import path from "path";
import AurisClient from "../structures/Client";
import Command from "../structures/Command";
import { logger } from "../structures/Logger";

export default class CommandHandler {
  constructor(private client: AurisClient) {}

  public load() {
    const commandsPath = path.join(__dirname, "../commands");
    if (!fs.existsSync(commandsPath)) return;

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
          const command = new CommandClass(this.client);
          this.client.commands.set(command.data.name, command);

          logger.debug(`Loaded command: ${command.data.name}`);
        }
      }
    }
  }
}
