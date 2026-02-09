import { KazagumoPlayer } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";

export default class PlayerDestroy extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerDestroy");
  }

  async execute(player: KazagumoPlayer) {
    console.log(`🗑️ Player destroyed for guild ${player.guildId}`);
  }
}
