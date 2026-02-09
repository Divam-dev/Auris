import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Stop extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop music & clears queue"),
    );
  }

  async execute(interaction: any) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const player = this.client.kazagumo.players.get(interaction.guildId);

    if (!player) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ Nothing is playing.");

      return interaction.reply({
        embeds: [errorEmbed],
        flags: [MessageFlags.Ephemeral],
      });
    }

    player.destroy();

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription("⏹️ **Stopped and cleared the queue**");

    return interaction.reply({
      embeds: [embed],
      flags: [MessageFlags.Ephemeral],
    });
  }
}
