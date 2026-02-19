import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  EmbedBuilder,
} from "discord.js";
import AurisClient from "../structures/Client";
import { KazagumoPlayer } from "kazagumo";

export class Utils {
  static async sameVoiceChannel(
    interaction: ChatInputCommandInteraction,
  ): Promise<GuildMember | null> {
    const member = interaction.member as GuildMember;

    if (!member?.voice?.channelId) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(
          "❌ You must be in a voice channel to use this command",
        );

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.reply({
          embeds: [embed],
          flags: [MessageFlags.Ephemeral],
        });
      }
      return null;
    }

    const botChannel = interaction.guild?.members.me?.voice.channelId;

    if (botChannel && member.voice.channelId !== botChannel) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ You must be in the same voice channel as the bot");

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.reply({
          embeds: [embed],
          flags: [MessageFlags.Ephemeral],
        });
      }
      return null;
    }

    return member;
  }

  static async isPlaying(
    client: AurisClient,
    interaction: ChatInputCommandInteraction,
  ): Promise<KazagumoPlayer | null> {
    const player = client.kazagumo.players.get(interaction.guildId!);

    if (!player || !player.queue.current) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ No song is currently playing");

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.reply({
          embeds: [embed],
          flags: [MessageFlags.Ephemeral],
        });
      }
      return null;
    }

    return player;
  }

  static formatTime(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    const paddedSeconds = seconds.toString().padStart(2, "0");
    const paddedMinutes = minutes.toString().padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${minutes}:${paddedSeconds}`;
  }
}
