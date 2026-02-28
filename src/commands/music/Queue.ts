import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder,
} from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Queue extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Shows the current music queue"),
    );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const player = await Utils.isPlaying(this.client, interaction);
    if (!player) return;

    const queue = player.queue;

    if (queue.length === 0) {
      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle(`🎶 Queue for ${interaction.guild?.name}`)
        .setDescription(
          `**Now Playing:**\n[${player.queue.current?.title}](${player.queue.current?.uri})`,
        );

      return interaction.reply({ embeds: [embed] });
    }

    let currentPage = 0;
    const tracksPerPage = 10;
    const totalPages = Math.ceil(queue.length / tracksPerPage);

    const generateEmbed = (page: number) => {
      const start = page * tracksPerPage;
      const end = start + tracksPerPage;
      const currentTracks = queue.slice(start, end);

      const totalDurationMs = queue.reduce(
        (acc, track) => acc + (track.length || 0),
        0,
      );
      const totalDurationFormatted = Utils.formatTime(totalDurationMs);

      const trackList = currentTracks
        .map(
          (track, index) =>
            `**${start + index + 1}.** [${track.title}](${track.uri}) \`[${Utils.formatTime(track.length || 0)}]\``,
        )
        .join("\n");

      return new EmbedBuilder()
        .setColor("Gold")
        .setTitle(`🎶 Queue for ${interaction.guild?.name}`)
        .setDescription(
          `**Now Playing:**\n[${player.queue.current?.title}](${player.queue.current?.uri})\n\n**Up Next:**\n${trackList}`,
        )
        .setFooter({
          text: `Page ${page + 1} of ${totalPages} • Tracks: ${queue.length} • Total time: ${totalDurationFormatted}`,
        });
    };

    const generateButtons = (page: number) => {
      return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("first")
          .setLabel("⏪")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),

        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("◀️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),

        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("▶️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages - 1),

        new ButtonBuilder()
          .setCustomId("last")
          .setLabel("⏩")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === totalPages - 1),
      );
    };

    await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: totalPages > 1 ? [generateButtons(currentPage)] : [],
    });

    const message = await interaction.fetchReply();

    if (totalPages <= 1) return;

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({
          content: "❌ You cannot use these buttons.",
          ephemeral: true,
        });
        return;
      }

      if (i.customId === "first") currentPage = 0;
      if (i.customId === "prev") currentPage--;
      if (i.customId === "next") currentPage++;
      if (i.customId === "last") currentPage = totalPages - 1;

      await i.update({
        embeds: [generateEmbed(currentPage)],
        components: [generateButtons(currentPage)],
      });

      collector.resetTimer();
    });

    collector.on("end", () => {
      message.edit({ components: [] }).catch(() => {});
    });
  }
}
