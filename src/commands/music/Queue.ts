import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";

export default class Queue extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Show the queue"),
    );
  }

  async execute(interaction: any) {
    const player = this.client.kazagumo.players.get(interaction.guildId);
    if (!player || !player.queue.current)
      return interaction.reply("❌ Queue is empty.");

    const current = player.queue.current;
    const tracks = player.queue
      .slice(0, 10)
      .map((t, i) => `${i + 1}. [${t.title}](${t.uri})`);

    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle("🎵 Queue")
      .setDescription(
        `**Now:** [${current.title}](${current.uri})\n\n${tracks.join("\n")}`,
      )
      .setFooter({ text: `${player.queue.length} songs total` });

    return interaction.reply({ embeds: [embed] });
  }
}
