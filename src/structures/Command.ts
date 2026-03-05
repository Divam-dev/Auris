import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  AutocompleteInteraction,
} from "discord.js";
import AurisClient from "./Client";

export default abstract class Command {
  client: AurisClient;
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;

  constructor(
    client: AurisClient,
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
  ) {
    this.client = client;
    this.data = data;
  }

  abstract execute(interaction: ChatInputCommandInteraction): Promise<unknown>;

  async autocomplete(interaction: AutocompleteInteraction): Promise<unknown> {
    return interaction.respond([]);
  }
}
