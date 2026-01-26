import { SlashCommandBuilder, version as djsVersion } from "discord.js";
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

  async execute(interaction: any) {
    const node = this.client.kazagumo.shoukaku.nodes.get("LocalNode");
    const uptime = process.uptime();

    const content = [
      "**🤖 Bot Information**",
      `> **📡 Ping:** \`${this.client.ws.ping}ms\``,
      `> **⏱️ Uptime:** \`${Math.floor(uptime / 3600)}h ${Math.floor(
        (uptime % 3600) / 60,
      )}m ${Math.floor(uptime % 60)}s\``,
      `> **🎵 Lavalink:** ${
        node?.state === 1 ? "🟢 Connected" : "🔴 Disconnected"
      }`,
      `> **💻 Memory:** \`${(
        process.memoryUsage().heapUsed /
        1024 /
        1024
      ).toFixed(2)} MB\``,
      `> **🛠️ Stack:** Node.js \`${process.version}\` | Discord.js \`v${djsVersion}\``,
    ].join("\n");

    return interaction.reply(content);
  }
}
