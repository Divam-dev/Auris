import { Message } from "discord.js";
import { KazagumoPlayer } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";

export default class PlayerDestroy extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerDestroy");
  }

  async execute(player: KazagumoPlayer) {
    const emptyTimeout = player.data.get("emptyTimeout") as NodeJS.Timeout;
    if (emptyTimeout) {
      clearTimeout(emptyTimeout);
      player.data.delete("emptyTimeout");
    }

    const lastMessage = player.data.get("nowPlayingMessage") as Message;
    if (lastMessage) {
      try {
        if (lastMessage.deletable) {
          await lastMessage.delete();
        }
      } catch (e) {}
    }

    this.client.logger.info(`🗑️ Player destroyed for guild ${player.guildId}`);
  }
}
