import { KazagumoPlayer } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";

export default class PlayerEmpty extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerEmpty");
  }

  async execute(player: KazagumoPlayer) {
    console.log(`🎵 Queue empty for guild ${player.guildId}, disconnecting...`);

    setTimeout(() => {
      if (player && player.queue.size === 0 && !player.queue.current) {
        player.destroy();
      }
    }, 30000);
  }
}
