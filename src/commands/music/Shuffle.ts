import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Shuffle extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffle the current music queue"),
    );
  }

  async execute(interaction: any) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const player = await Utils.isPlaying(this.client, interaction);
    if (!player) return;

    if (player.queue.length === 0) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ The queue is empty, nothing to shuffle.");

      return interaction.reply({
        embeds: [errorEmbed],
        flags: [MessageFlags.Ephemeral],
      });
    }

    player.queue.shuffle();

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription("🔀 **Queue shuffled successfully!**");

    return interaction.reply({
      embeds: [embed],
      flags: [MessageFlags.Ephemeral],
    });
  }
}