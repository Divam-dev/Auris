import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Clear extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear the current queue"),
    );
  }

  async execute(interaction: any) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const player = this.client.kazagumo.players.get(interaction.guildId);

    if (!player || player.queue.length === 0) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ The queue is already empty.");

      return interaction.reply({ embeds: [embed] });
    }

    player.queue.clear();

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription("🗑️ **Cleared the queue!**");

    return interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  }
}
