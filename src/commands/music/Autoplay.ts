import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Autoplay extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("autoplay")
        .setDescription("Toggle autoplay mode"),
    );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const player = await Utils.isPlaying(this.client, interaction);
    if (!player) return;

    const isAutoplay = player.data.get("autoplay") ?? false;
    player.data.set("autoplay", !isAutoplay);

    const embed = new EmbedBuilder()
      .setColor(isAutoplay ? "Red" : "Green")
      .setDescription(
        `📻 Autoplay is now **${!isAutoplay ? "enabled" : "disabled"}**`,
      );

    return interaction.reply({ embeds: [embed] });
  }
}
