import { SlashCommandBuilder } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Stop extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop music & clears queue"),
    );
  }

  async execute(interaction: any) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const player = this.client.kazagumo.players.get(interaction.guildId);

    if (!player) {
      return interaction.reply({
        content: "❌ Nothing is playing.",
        ephemeral: true,
      });
    }

    player.destroy();

    return interaction.reply("⏹️ **Stopped**");
  }
}
