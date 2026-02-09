import { TextChannel, EmbedBuilder } from "discord.js";
import { KazagumoPlayer } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";

export default class PlayerEmpty extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerEmpty");
  }

  async execute(player: KazagumoPlayer) {
    console.log(`🎵 Queue empty for guild ${player.guildId}`);

    const channel = this.client.channels.cache.get(
      player.textId!,
    ) as TextChannel;

    if (channel) {
      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("Queue Finalized")
        .setDescription("The queue has ended. Waiting for new tracks...");

      await channel.send({ embeds: [embed] });
    }

    setTimeout(async () => {
      if (player && player.queue.size === 0 && !player.queue.current) {
        if (channel) {
          const leaveEmbed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle("👋 Left Voice Channel")
            .setDescription(
              "I left the voice channel after being alone for 1 minute.",
            );

          await channel.send({ embeds: [leaveEmbed] });
        }

        player.destroy();
      }
    }, 60000);
  }
}
