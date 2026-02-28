import { TextChannel, EmbedBuilder } from "discord.js";
import { KazagumoPlayer } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";
import { logger } from "../../structures/Logger";

interface ExceptionData {
  exception?: { message?: string; severity?: string };
  error?: string;
  message?: string;
}

export default class PlayerException extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerException");
  }

  async execute(player: KazagumoPlayer, data: ExceptionData) {
    logger.error("Player Exception Data:", data);

    const channel = this.client.channels.cache.get(
      player.textId!,
    ) as TextChannel;
    
    if (channel) {
      const errorMessage = data.exception?.message || data.error || data.message || "Unknown Lavalink Error";
      
      let description = `❌ **Playback Error:** \`${errorMessage}\``;

      if (
        errorMessage.includes("requires login") || 
        errorMessage.includes("age verification") ||
        errorMessage.includes("viewed anonymously")
      ) {
        description = "🔞 **Video Blocked:** YouTube requires authorization or age verification for this track.";
      } else if (
        errorMessage.includes("private video") || 
        errorMessage.includes("unplayable") ||
        errorMessage.includes("trailer cannot be loaded")
      ) {
        description = "🚫 **Unavailable:** This video is private, deleted, or a premiere that hasn't started yet.";
      } else if (errorMessage.includes("429 Too Many Requests")) {
        description = "🛑 **Rate Limited:** YouTube has temporarily blocked the bot. Try again later or use another source.";
      }

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(description);

      await channel.send({ embeds: [embed] });
    }
  }
}