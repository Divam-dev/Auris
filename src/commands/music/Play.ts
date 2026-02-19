import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";
import { logger } from "../../structures/Logger";

export default class Play extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Provides the song name or URL")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    );
  }

  async execute(interaction: any) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const query = interaction.options.getString("query", true);
    await interaction.deferReply();

    const player = await this.client.kazagumo.createPlayer({
      guildId: interaction.guildId,
      textId: interaction.channelId,
      voiceId: member.voice.channelId!,
      shardId: interaction.guild?.shardId || 0,
      volume: 100,
      deaf: true,
    });

    logger.debug(`Searching for: ${query}`);

    const result = await this.client.kazagumo.search(query, {
      requester: interaction.user,
    });

    logger.debug(`Result Type: ${result.type}`);

    if (!result.tracks.length) {
      logger.debug(`Empty Result Dump: ${JSON.stringify(result, null, 2)}`);

      const error = (
        result as { exception?: { message: string; severity: string } }
      ).exception;

      if (error) {
        logger.error(`Lavalink Exception:`, error);
        return interaction.editReply(
          `❌ **Load Failed:** \`${error.message || "Unknown Lavalink Error"}\`\n*Severity: ${error.severity || "Unknown"}*`,
        );
      }

      return interaction.editReply(
        "❌ No results found. (Check console for debug dump)",
      );
    }

    if (result.type === "PLAYLIST") {
      for (const track of result.tracks) player.queue.add(track);
      if (!player.playing) await player.play();

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Playlist Added")
        .setDescription(
          `**${result.playlistName}** (${result.tracks.length} tracks) added to queue.`,
        )
        .setFooter({ text: `Requested by: ${interaction.user.username}` });

      return interaction.editReply({ content: "", embeds: [embed] });
    } else {
      const track = result.tracks[0];
      player.queue.add(track);

      const position = player.queue.length;

      if (!player.playing) await player.play();

      const posString = position === 0 ? "Now Playing" : `#${position}`;
      const duration = Utils.formatTime(track.length || 0);
      const requester = interaction.user.username;

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({
          name: "Track Added",
          iconURL: this.client.user?.displayAvatarURL(),
        })
        .setDescription(
          `**[${track.title}](${track.uri})**\n` +
            `by **${track.author}** added to queue.`,
        )
        .setThumbnail(track.thumbnail || null)
        .setFooter({
          text: `Position ${posString} • Duration: ${duration} • By: ${requester}`,
        });

      return interaction.editReply({ content: "", embeds: [embed] });
    }
  }

  async autocomplete(interaction: any) {
    const focused = interaction.options.getFocused();
    if (!focused) return interaction.respond([]);

    if (/^https?:\/\//.test(focused)) {
      return interaction.respond([]);
    }

    try {
      const result = await this.client.kazagumo.search(focused, {
        requester: interaction.user,
      });

      const choices = result.tracks.slice(0, 25).map((t) => ({
        name: `${t.title} - ${t.author} - ${Utils.formatTime(t.length ?? 0)}`.substring(
          0,
          100,
        ),
        value: t.uri || t.title,
      }));

      await interaction.respond(choices);
    } catch (error) {
      if (!interaction.responded) {
        await interaction.respond([]).catch(() => {});
      }
    }
  }
}
