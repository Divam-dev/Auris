import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  version as djsVersion,
} from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";

export default class Info extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("info")
        .setDescription("Display bot status"),
    );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const node = this.client.kazagumo.shoukaku.nodes.get("LocalNode");
    const uptime = process.uptime();

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("🤖 Bot Information")
      .addFields(
        {
          name: "📡 Ping",
          value: `\`${this.client.ws.ping}ms\``,
          inline: true,
        },
        {
          name: "⏱️ Uptime",
          value: `\`${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s\``,
          inline: true,
        },
        {
          name: "🎵 Lavalink",
          value: node?.state === 1 ? "🟢 Connected" : "🔴 Disconnected",
          inline: true,
        },
        {
          name: "💻 Memory",
          value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``,
          inline: true,
        },
        {
          name: "🛠️ Stack",
          value: `Node.js \`${process.version}\` | Discord.js \`v${djsVersion}\``,
          inline: false,
        },
      );

    return interaction.reply({ embeds: [embed] });
  }
}
