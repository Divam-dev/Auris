import { TextChannel } from "discord.js";
import { KazagumoPlayer } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";
import { logger } from "../../structures/Logger";

export default class PlayerStuck extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerStuck");
  }

  async execute(player: KazagumoPlayer, data: any) {
    logger.warn("⚠️ Player Stuck:", data);

    const channel = this.client.channels.cache.get(
      player.textId!,
    ) as TextChannel;
    if (channel) {
      await channel.send(
        `⚠️ **Track Stuck:** Buffering timed out. Skipping...`,
      );
    }

    player.skip();
  }
}
