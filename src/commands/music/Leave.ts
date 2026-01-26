import { SlashCommandBuilder } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Leave extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Disconnect the bot from the voice channel"),
    );
  }

  async execute(interaction: any) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const player = this.client.kazagumo.players.get(interaction.guildId);

    if (player) {
      player.destroy();
      return interaction.reply(
        `👋 **Disconnected from <#${member.voice.channelId}>**`,
      );
    } else {
      this.client.kazagumo.shoukaku.leaveVoiceChannel(interaction.guildId);
      return interaction.reply(
        `👋 **Disconnected from <#${member.voice.channelId}>**`,
      );
    }
  }
}
