import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Seek extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("seek")
        .setDescription("Seek to a specific time in the track")
        .addStringOption((option) =>
          option
            .setName("time")
            .setDescription("Time to seek to (e.g., 1:30 or 90s)")
            .setRequired(true),
        ),
    );
  }

  async execute(interaction: any) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const player = await Utils.isPlaying(this.client, interaction);
    if (!player) return;

    if (!player.queue.current?.isSeekable) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ This track is not seekable.");
      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const timeString = interaction.options.getString("time", true);
    const position = this.parseTimeZh(timeString);

    if (position === null) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(
          "❌ Invalid time format. Use `mm:ss`, `hh:mm:ss`, or seconds (e.g., `1:30`, `90`).",
        );
      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const duration = player.queue.current.length || 0;
    if (position > duration) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ You cannot seek past the end of the track.");
      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    player.seek(position);

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`⏩ **Seeked to ${Utils.formatTime(position)}**`);

    return interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  }

  private parseTimeZh(time: string): number | null {
    const timeRegex = /^(\d{1,2}:)?(\d{1,2}):(\d{2})$/;
    const secondsRegex = /^(\d+)s?$/;

    if (secondsRegex.test(time)) {
      const match = time.match(secondsRegex);
      return match ? parseInt(match[1]) * 1000 : null;
    }

    if (timeRegex.test(time)) {
      const match = time.match(timeRegex);
      if (!match) return null;

      const hours = match[1] ? parseInt(match[1].replace(":", "")) : 0;
      const minutes = parseInt(match[2]);
      const seconds = parseInt(match[3]);

      return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }

    return null;
  }
}
