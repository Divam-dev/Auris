import { TextChannel } from "discord.js";
import { KazagumoPlayer } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";

export default class PlayerException extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerException");
  }

  async execute(player: KazagumoPlayer, error: any) {
    console.error("❌ Player Exception:", error);

    const channel = this.client.channels.cache.get(
      player.textId!,
    ) as TextChannel;
    if (channel) {
      await channel.send(
        `❌ **Track Failed:** ${error.message || "Unknown error"}`,
      );
    }
  }
}
