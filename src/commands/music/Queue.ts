import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Queue extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Show the queue"),
    );
  }

  async execute(interaction: any) {
    const player = this.client.kazagumo.players.get(interaction.guildId);

    const emptyEmbed = new EmbedBuilder()
      .setColor("Red")
      .setDescription("❌ The queue is empty.");

    if (!player || !player.queue.current) {
      return interaction.reply({
        embeds: [emptyEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (player.queue.length === 0) {
      return interaction.reply({
        embeds: [emptyEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const current = player.queue.current;
    const currentDuration = Utils.formatTime(current.length || 0);
    const currentRequester = current.requester
      ? `<@${(current.requester as any).id}>`
      : "Unknown";

    const nowPlayingDescription =
      `**[${current.title}](${current.uri})**\n` +
      `By: ${current.author} • \`${currentDuration}\` • Requested by: ${currentRequester}`;

    const tracks = player.queue.slice(0, 10).map((track, i) => {
      const requester = track.requester
        ? `<@${(track.requester as any).id}>`
        : "Unknown";
      return `**${i + 1}.** [${track.title}](${track.uri}) • *${track.author}* • \`${Utils.formatTime(track.length || 0)}\` • ${requester}`;
    });

    const totalDurationMs = player.queue.reduce(
      (acc, track) => acc + (track.length || 0),
      0,
    );
    const totalDuration = Utils.formatTime(totalDurationMs);
    const hiddenTracks = player.queue.length - 10;

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("Music Queue")
      .setThumbnail(current.thumbnail || null)
      .setDescription(
        `**Now Playing**\n${nowPlayingDescription}\n\n` +
          `**__Up Next__**\n${tracks.join("\n")}` +
          (hiddenTracks > 0 ? `\n\n*...and ${hiddenTracks} more tracks*` : ""),
      )
      .setFooter({
        text: `Queue: ${player.queue.length} tracks • Total Duration: ${totalDuration}`,
        iconURL: interaction.guild?.iconURL() || undefined,
      });

    return interaction.reply({ embeds: [embed] });
  }
}
