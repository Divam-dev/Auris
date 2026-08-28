import { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";

export default class PlayerEnd extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerEnd");
  }

  async execute(player: KazagumoPlayer, track: KazagumoTrack) {
    if (player.loop !== "track" && player.data.has("activeFilter")) {
      try {
        await player.shoukaku.clearFilters();
      } catch (e) {}

      player.data.delete("activeFilter");
    }

    this.client.logger.success(
      `Track ended: ${track?.title ?? "Unknown Title"} in guild ${player.guildId}`,
    );
  }
}
