import {
  EmbedBuilder,
  TextChannel,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  User,
} from "discord.js";
import { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";
import { logger } from "../../structures/Logger";

export default class PlayerStart extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerStart");
  }

  async execute(player: KazagumoPlayer, track: KazagumoTrack) {
    const emptyTimeout = player.data.get("emptyTimeout") as NodeJS.Timeout;
    if (emptyTimeout) {
      clearTimeout(emptyTimeout);
      player.data.delete("emptyTimeout");
    }

    const lastTrackId = player.data.get("lastTrackId") as string;
    if (player.loop === "track" && lastTrackId === track.identifier) {
      return;
    }

    player.data.set("previousTrack", track);

    const history = (player.data.get("history") as string[]) || [];
    history.push(track.identifier);

    if (history.length > 50) {
      history.shift();
    }

    player.data.set("history", history);
    player.data.set("lastTrackId", track.identifier);

    const channel = this.client.channels.cache.get(
      player.textId!,
    ) as TextChannel;
    if (!channel) return;

    const lastMessage = player.data.get("nowPlayingMessage") as Message;
    if (lastMessage) {
      try {
        if (lastMessage.deletable) await lastMessage.delete();
      } catch (e) {}
    }

    const duration = track.length || 0;

    const isAutoplay = track.requester === "Autoplay";

    const requesterName = isAutoplay
      ? "🤖 Autoplay"
      : `<@${(track.requester as User).id}>`;

    let trackUrl = track.uri || "";
    if (trackUrl.includes("spotify")) {
      const searchQuery = encodeURIComponent(`${track.author} ${track.title}`);
      trackUrl = `https://music.youtube.com/search?q=${searchQuery}`;
    }

    const durationDisplay = track.isStream
      ? "🔴 **LIVE**"
      : `\`${Utils.formatTime(track.length || 0)}\``;

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setAuthor({
        name: track.isStream ? "🔴 Now Streaming Live" : "Now Playing",
        iconURL: this.client.user?.displayAvatarURL(),
      })
      .setDescription(
        `**[${track.title}](${track.uri})**\n\n` +
          `🖌️ **Author:** ${track.author}\n` +
          `👤 **Requested by:** ${requesterName}\n` +
          `🕒 **Duration:** \`${durationDisplay}\`\n\n`,
      )
      .setThumbnail(track.thumbnail || null);

    const isAutoplayEnabled = (player.data.get("autoplay") as boolean) ?? false;

    let loopStyle = ButtonStyle.Secondary;
    let loopLabel = "Loop";
    if (player.loop === "track") {
      loopStyle = ButtonStyle.Primary;
      loopLabel = "Loop (Track)";
    } else if (player.loop === "queue") {
      loopStyle = ButtonStyle.Success;
      loopLabel = "Loop (Queue)";
    }

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("music_prev")
        .setEmoji("⏮️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("music_pause")
        .setEmoji("⏸️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("music_skip")
        .setEmoji("⏭️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("music_stop")
        .setEmoji("⏹️")
        .setStyle(ButtonStyle.Danger),
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("music_loop")
        .setLabel(loopLabel)
        .setEmoji("🔁")
        .setStyle(loopStyle),
      new ButtonBuilder()
        .setCustomId("music_shuffle")
        .setLabel("Shuffle")
        .setEmoji("🔀")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("music_autoplay")
        .setLabel("Autoplay")
        .setEmoji("📻")
        .setStyle(
          isAutoplayEnabled ? ButtonStyle.Success : ButtonStyle.Secondary,
        ),
    );

    try {
      const message = await channel.send({
        embeds: [embed],
        components: [row1, row2],
      });
      player.data.set("nowPlayingMessage", message);
    } catch (e) {
      logger.error("Could not send playerStart message", e);
    }
  }
}
