import { Interaction } from "discord.js";
import Event from "../structures/Event";
import AurisClient from "../structures/Client";

export default class InteractionCreate extends Event {
  constructor(client: AurisClient) {
    super(client, "interactionCreate");
  }

  async execute(interaction: Interaction) {
    if (interaction.isAutocomplete()) {
      const command = this.client.commands.get(interaction.commandName);
      if (command) await command.autocomplete(interaction);
    }

    if (interaction.isChatInputCommand()) {
      const command = this.client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
    }
  }
}
