import {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  ChatInputCommandInteraction,
} from "discord.js";
import { PlayerState } from "kazagumo";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";
import { logger } from "../../structures/Logger";

export default class Join extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("join")
        .setDescription("Join the voice channel"),
    );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const botVoiceChannel = interaction.guild?.members.me?.voice.channelId;
    let player = this.client.kazagumo.players.get(interaction.guildId!);

    if (player && !botVoiceChannel) {
      player.destroy();
      player = undefined;
    }

    if (!player) {
      player = await this.client.kazagumo.createPlayer({
        guildId: interaction.guildId!,
        textId: interaction.channelId,
        voiceId: member.voice.channelId!,
        shardId: interaction.guild?.shardId || 0,
        volume: 100,
        deaf: true,
      });
    }

    try {
      if (!player.voiceId) player.setVoiceChannel(member.voice.channelId!);

      if (player.state !== PlayerState.CONNECTED) {
        await player.connect();
      } else if (player.voiceId !== member.voice.channelId) {
        player.setVoiceChannel(member.voice.channelId!);
      }

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`👋 **Joined** <#${member.voice.channelId}>!`);

      return interaction.editReply({ embeds: [embed] });
    } catch (error: unknown) {
      const embed = new EmbedBuilder().setColor("Red");

      const errorMessage = error instanceof Error ? error.message : "";

      if (
        player?.state === PlayerState.CONNECTED ||
        errorMessage.includes("already connected")
      ) {
        embed.setColor("Green");
        embed.setDescription(`👋 **Joined** <#${member.voice.channelId}>!`);
        return interaction.editReply({ embeds: [embed] });
      }

      logger.error("Join Error:", error);
      embed.setDescription("❌ Failed to join the channel.");
      return interaction.editReply({ embeds: [embed] });
    }
  }
}
