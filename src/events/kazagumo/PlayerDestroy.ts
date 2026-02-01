import { TextChannel } from "discord.js";
import { KazagumoPlayer } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";

export default class PlayerDestroy extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerDestroy");
  }

  async execute(player: KazagumoPlayer) {
    console.log(`🗑️ Player destroyed for guild ${player.guildId}`);

    try {
      const channel = this.client.channels.cache.get(
        player.textId!,
      ) as TextChannel;

      if (channel) {
        await channel.send("👋 **Disconnected** - Thanks for listening!");
      }
    } catch (error) {
      console.log("Could not send disconnect message:", error);
    }
  }
}
