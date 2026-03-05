import { TextChannel } from "discord.js";
import { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";
import { logger } from "../../structures/Logger";

export default class PlayerResolveError extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerResolveError");
  }

  async execute(player: KazagumoPlayer, track: KazagumoTrack, error: Error) {
    logger.error("❌ Track Resolve Error:", error.message);

    const channel = this.client.channels.cache.get(
      player.textId!,
    ) as TextChannel;
    if (channel) {
      await channel.send(
        `❌ **Failed to load track:** ${track?.title || "Unknown"}\n` +
          `Reason: ${error.message || "Unknown error"}`,
      );
    }

    if (player.queue.size > 0) player.skip();
  }
}
