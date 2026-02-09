import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Pause extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pause the current track"),
    );
  }

  async execute(interaction: any) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const player = await Utils.isPlaying(this.client, interaction);
    if (!player) return;

    if (player.paused) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("⚠️ The music is **already paused**");

      return interaction.reply({
        embeds: [errorEmbed],
        flags: [MessageFlags.Ephemeral],
      });
    }

    player.pause(true);

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription("⏸️ **Paused**");

    return interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  }
}
