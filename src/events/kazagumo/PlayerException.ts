import { TextChannel, EmbedBuilder } from "discord.js";
import { KazagumoPlayer } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";
import { logger } from "../../structures/Logger";

export default class PlayerException extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerException");
  }

  async execute(player: KazagumoPlayer, error: any) {
    logger.error("❌ Player Exception:", error);

    const channel = this.client.channels.cache.get(
      player.textId!,
    ) as TextChannel;
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(
          `❌ **Track Failed:** ${error.message || "Unknown error"}`,
        );

      await channel.send({ embeds: [embed] });
    }
  }
}
