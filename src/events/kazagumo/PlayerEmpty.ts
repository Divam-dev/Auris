import { TextChannel, EmbedBuilder, Message } from "discord.js";
import { KazagumoPlayer } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";

export default class PlayerEmpty extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerEmpty");
  }

  async execute(player: KazagumoPlayer) {
    this.client.logger.info(`🎵 Queue empty for guild ${player.guildId}`);

    const channel = this.client.channels.cache.get(
      player.textId!,
    ) as TextChannel;

    const lastMessage = player.data.get("nowPlayingMessage") as Message;
    if (lastMessage) {
      try {
        if (lastMessage.deletable) await lastMessage.delete();
      } catch (e) {}
    }

    if (channel) {
      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("Queue Finalized")
        .setDescription("The queue has ended. Waiting for new tracks...");

      await channel.send({ embeds: [embed] });
    }

    const existingTimeout = player.data.get("emptyTimeout") as NodeJS.Timeout;
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(async () => {
      if (player && player.queue.size === 0 && !player.queue.current) {
        if (channel) {
          const leaveEmbed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle("👋 Left Voice Channel")
            .setDescription(
              "I left the voice channel after being alone for 1 minute.",
            );

          await channel.send({ embeds: [leaveEmbed] }).catch(() => {});
        }

        player.destroy();
      }
    }, 60000);

    player.data.set("emptyTimeout", timeout);
  }
}
