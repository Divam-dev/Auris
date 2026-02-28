import { TextChannel, EmbedBuilder, Message } from "discord.js";
import { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import KazagumoEvent from "../../structures/KazagumoEvent";
import AurisClient from "../../structures/Client";

export default class PlayerEmpty extends KazagumoEvent {
  constructor(client: AurisClient) {
    super(client, "playerEmpty");
  }

  async execute(player: KazagumoPlayer) {
    const channel = this.client.channels.cache.get(
      player.textId!,
    ) as TextChannel;

    const isAutoplay = player.data.get("autoplay") as boolean;
    const previousTrack = player.data.get("previousTrack") as KazagumoTrack;

    const isStopped = player.data.get("stopped") as boolean;

    if (isAutoplay && previousTrack && !isStopped) {
      try {
        let result;

        this.client.logger.info(
          `[Autoplay] Finding next track for: ${previousTrack.title} by ${previousTrack.author}`,
        );

        const isYouTubeSource = ["youtube", "youtubemusic"].includes(
          previousTrack.sourceName,
        );

        if (isYouTubeSource) {
          const mixURL = `https://www.youtube.com/watch?v=${previousTrack.identifier}&list=RD${previousTrack.identifier}`;
          result = await this.client.kazagumo.search(mixURL);
        } else {
          const fallbackQuery = `ytmsearch:${previousTrack.author} ${previousTrack.title}`;
          result = await this.client.kazagumo.search(fallbackQuery);
        }

        if (!result || !result.tracks.length) {
          this.client.logger.warn(
            `[Autoplay] Mix search failed, trying general author mix...`,
          );
          result = await this.client.kazagumo.search(
            `ytmsearch:${previousTrack.author} mix`,
          );
        }

        if (result && result.tracks.length > 0) {
          const history = (player.data.get("history") as string[]) || [];

          const unplayedTracks = result.tracks.filter(
            (t) => !history.includes(t.identifier),
          );

          let nextTrack;

          if (unplayedTracks.length > 0) {
            const poolSize = Math.min(unplayedTracks.length, 3);
            const randomIndex = Math.floor(Math.random() * poolSize);
            nextTrack = unplayedTracks[randomIndex];
          } else {
            nextTrack =
              result.tracks.find(
                (t) => t.identifier !== previousTrack.identifier,
              ) || result.tracks[0];
          }

          nextTrack.requester = this.client.user;

          player.queue.add(nextTrack);
          await player.play();

          return;
        }
      } catch (error) {
        this.client.logger.error("Autoplay Error:", error);
      }
    }

    this.client.logger.info(`Queue empty for guild ${player.guildId}`);

    const lastMessage = player.data.get("nowPlayingMessage") as Message;
    if (lastMessage) {
      try {
        if (lastMessage.deletable) await lastMessage.delete();
      } catch (e) {}
    }

    if (channel) {
      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("Queue Finalized")
        .setDescription("The queue has ended. Waiting for new tracks...");

      await channel.send({ embeds: [embed] });
    }

    const existingTimeout = player.data.get("emptyTimeout") as NodeJS.Timeout;
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(async () => {
      if (player && player.queue.size === 0 && !player.queue.current) {
        if (channel) {
          const leaveEmbed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle("👋 Left Voice Channel")
            .setDescription(
              "I left the voice channel after being alone for 1 minute.",
            );

          await channel.send({ embeds: [leaveEmbed] }).catch(() => {});
        }

        player.destroy();
      }
    }, 60000);

    player.data.set("emptyTimeout", timeout);
  }
}
