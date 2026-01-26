import { SlashCommandBuilder } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Play extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Provides the song name or URL")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    );
  }

  async execute(interaction: any) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const query = interaction.options.getString("query", true);
    await interaction.deferReply();

    const player = await this.client.kazagumo.createPlayer({
      guildId: interaction.guildId,
      textId: interaction.channelId,
      voiceId: member.voice.channelId!,
      shardId: interaction.guild?.shardId || 0,
      volume: 100,
      deaf: true,
    });

    const result = await this.client.kazagumo.search(query, {
      requester: interaction.user,
    });

    if (!result.tracks.length)
      return interaction.editReply("❌ No results found!");

    if (result.type === "PLAYLIST") {
      for (const track of result.tracks) player.queue.add(track);
      if (!player.playing) await player.play();
      return interaction.editReply(
        `✅ Added Playlist **${result.playlistName}**!`,
      );
    } else {
      const track = result.tracks[0];
      player.queue.add(track);
      if (!player.playing) await player.play();
      return interaction.editReply(`✅ Added **${track.title}** to the queue!`);
    }
  }

  async autocomplete(interaction: any) {
    const focused = interaction.options.getFocused();
    if (!focused) return interaction.respond([]);

    try {
      const result = await this.client.kazagumo.search(focused, {
        requester: interaction.user,
      });
      const choices = result.tracks.slice(0, 25).map((t) => ({
        name: `${t.title} - ${t.author}`.substring(0, 100),
        value: t.uri || t.title,
      }));
      await interaction.respond(choices);
    } catch (error) {
      await interaction.respond([]);
    }
  }
}
