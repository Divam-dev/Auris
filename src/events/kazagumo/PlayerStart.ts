import { EmbedBuilder, TextChannel, Message } from "discord.js";
import { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class PlayerStart extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerStart");
  }

  async execute(player: KazagumoPlayer, track: KazagumoTrack) {
    const channel = this.client.channels.cache.get(
      player.textId!,
    ) as TextChannel;
    if (!channel) return;

    const lastMessage = player.data.get("nowPlayingMessage") as Message;

    if (lastMessage) {
      try {
        if (lastMessage.deletable) {
          await lastMessage.delete();
        }
      } catch (e) {}
    }

    const duration = track.length || 0;

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
          `🕒 **Duration:** \`${Utils.formatTime(duration)}\`\n\n`,
      )
      .setThumbnail(track.thumbnail || null);

    try {
      const message = await channel.send({ embeds: [embed] });
      player.data.set("nowPlayingMessage", message);
    } catch (e) {
      console.error("Could not send playerStart message", e);
    }
  }
}
