import { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";

export default class PlayerEnd extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerEnd");
  }

  async execute(player: KazagumoPlayer, track: KazagumoTrack) {
    console.log(`✅ Track ended: ${track.title} in guild ${player.guildId}`);
  }
}
