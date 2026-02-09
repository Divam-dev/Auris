import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class NowPlaying extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("Show the currently playing song"),
    );
  }

  async execute(interaction: any) {
    const player = this.client.kazagumo.players.get(interaction.guildId);

    if (!player || !player.queue.current) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ Nothing is currently playing.");

      return interaction.reply({ embeds: [embed] });
    }

    const track = player.queue.current;

    const duration = track.length || 0;
    const position = player.position;

    const totalBars = 15;
    const progress = Math.round((position / duration) * totalBars);
    const clampedProgress = Math.min(progress, totalBars);
    const progressBar =
      "▬".repeat(clampedProgress) +
      "🔘" +
      "▬".repeat(totalBars - clampedProgress);

    const timeString = `${Utils.formatTime(position)} / ${Utils.formatTime(duration)}`;

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setAuthor({
        name: "Now Playing",
        iconURL: this.client.user?.displayAvatarURL(),
      })
      .setDescription(
        `**[${track.title}](${track.uri})**\n\n` +
          `🖌️ **Author:** ${track.author}\n` +
          `👤 **Requester:** ${track.requester ?? "Unknown"}\n` +
          `🕒 **Duration:** \`${timeString}\`\n\n` +
          `\`${progressBar}\``,
      )
      .setThumbnail(track.thumbnail || null);

    return interaction.reply({ embeds: [embed] });
  }
}
