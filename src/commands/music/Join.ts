import { SlashCommandBuilder } from "discord.js";
import { PlayerState } from "kazagumo";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Join extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("join")
        .setDescription("Join the voice channel"),
    );
  }

  async execute(interaction: any) {
    await interaction.deferReply();

    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return interaction.deleteReply();

    const botVoiceChannel = interaction.guild?.members.me?.voice.channelId;
    let player = this.client.kazagumo.players.get(interaction.guildId);

    if (player && !botVoiceChannel) {
      player.destroy();
      player = undefined;
    }

    if (!player) {
      player = await this.client.kazagumo.createPlayer({
        guildId: interaction.guildId,
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

      return interaction.editReply(
        `👋 **Joined** <#${member.voice.channelId}>!`,
      );
    } catch (error: any) {
      if (
        player?.state === PlayerState.CONNECTED ||
        error.message?.includes("already connected")
      ) {
        return interaction.editReply(
          `👋 **Joined** <#${member.voice.channelId}>!`,
        );
      }

      console.error("Join Error:", error);
      return interaction.editReply("❌ Failed to join the channel.");
    }
  }
}
