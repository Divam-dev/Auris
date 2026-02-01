import { TextChannel } from "discord.js";
import { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";

export default class PlayerStart extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerStart");
  }

  async execute(player: KazagumoPlayer, track: KazagumoTrack) {
    const channel = this.client.channels.cache.get(
      player.textId!,
    ) as TextChannel;
    if (channel) {
      await channel.send(`▶️ Now playing: **${track.title}**`);
    }
  }
}
