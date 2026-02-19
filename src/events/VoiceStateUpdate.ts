import { VoiceState } from "discord.js";
import Event from "../structures/Event";
import AurisClient from "../structures/Client";
import { logger } from "../structures/Logger";

export default class VoiceStateUpdate extends Event {
  constructor(client: AurisClient) {
    super(client, "voiceStateUpdate");
  }

  async execute(oldState: VoiceState, newState: VoiceState) {
    if (oldState.member?.id !== this.client.user?.id) return;

    if (oldState.channelId && !newState.channelId) {
      const player = this.client.kazagumo.players.get(oldState.guild.id);

      if (player) {
        player.destroy();
        logger.warn(
          `Player destroyed for guild ${oldState.guild.name} (Force Disconnect)`,
        );
      }
    }
  }
}
