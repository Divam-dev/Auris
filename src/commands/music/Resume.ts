import { SlashCommandBuilder } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Resume extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resume the paused track"),
    );
  }

  async execute(interaction: any) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const player = await Utils.isPlaying(this.client, interaction);
    if (!player) return;

    if (!player.paused) {
      return interaction.reply({
        content: "⚠️ The music is **not paused**!",
        ephemeral: true,
      });
    }

    player.pause(false);
    return interaction.reply("▶️ **Resumed**!");
  }
}
