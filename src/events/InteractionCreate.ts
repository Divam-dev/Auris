import {
  Interaction,
  GuildMember,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import Event from "../structures/Event";
import AurisClient from "../structures/Client";

export default class InteractionCreate extends Event {
  constructor(client: AurisClient) {
    super(client, "interactionCreate");
  }

  async execute(interaction: Interaction) {
    if (interaction.isAutocomplete()) {
      const command = this.client.commands.get(interaction.commandName);
      if (command) await command.autocomplete(interaction);
    }

    if (interaction.isChatInputCommand()) {
      const command = this.client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
    }

    if (interaction.isButton() && interaction.customId.startsWith("music_")) {
      const member = interaction.member as GuildMember;
      const botChannel = interaction.guild?.members.me?.voice.channelId;

      if (
        !member?.voice?.channelId ||
        (botChannel && member.voice.channelId !== botChannel)
      ) {
        return interaction.reply({
          content: "❌ You must be in the same voice channel as the bot.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const player = this.client.kazagumo.players.get(interaction.guildId!);
      if (!player) {
        return interaction.reply({
          content: "❌ No music is currently playing.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const updateButtonState = async (
        customIdToChange: string,
        modifier: (btn: ButtonBuilder) => void,
      ) => {
        const btnInteraction =
          interaction as import("discord.js").ButtonInteraction;

        const newComponents = btnInteraction.message.components.map(
          (row: any) => {
            const actionRow = new ActionRowBuilder<ButtonBuilder>();

            row.components.forEach((component: any) => {
              if (component.type === 2) {
                const button = ButtonBuilder.from(component);
                if (component.customId === customIdToChange) {
                  modifier(button);
                }
                actionRow.addComponents(button);
              }
            });
            return actionRow;
          },
        );

        await btnInteraction.update({ components: newComponents });
      };

      switch (interaction.customId) {
        case "music_prev":
          if (player.position > 5000) {
            player.seek(0);
            await interaction.reply({
              content: "⏪ Restarted current track.",
              flags: MessageFlags.Ephemeral,
            });
          } else if (player.queue.previous.length > 0) {
            const prev = player.queue.previous.pop();
            if (prev) {
              player.queue.unshift(prev);
              player.skip();
              await interaction.deferUpdate();
            }
          } else {
            player.seek(0);
            await interaction.reply({
              content: "⏪ Restarted current track.",
              flags: MessageFlags.Ephemeral,
            });
          }
          break;

        case "music_pause": {
          const isPaused = !player.paused;
          player.pause(isPaused);

          await updateButtonState("music_pause", (btn) => {
            btn.setEmoji(isPaused ? "▶️" : "⏸️");
            btn.setStyle(
              isPaused ? ButtonStyle.Success : ButtonStyle.Secondary,
            );
          });
          break;
        }

        case "music_skip":
          player.skip();
          await interaction.deferUpdate();
          break;

        case "music_stop":
          player.data.set("stopped", true);
          player.queue.clear();
          player.skip();
          await interaction.reply({
            content: "⏹️ Stopped music and cleared the queue.",
            flags: MessageFlags.Ephemeral,
          });
          break;

        case "music_loop": {
          const modes = ["none", "track", "queue"] as const;
          const nextMode =
            modes[(modes.indexOf(player.loop) + 1) % modes.length];
          player.setLoop(nextMode);

          await updateButtonState("music_loop", (btn) => {
            if (nextMode === "none") {
              btn.setStyle(ButtonStyle.Secondary);
              btn.setLabel("Loop");
            } else if (nextMode === "track") {
              btn.setStyle(ButtonStyle.Primary);
              btn.setLabel("Loop (Track)");
            } else {
              btn.setStyle(ButtonStyle.Success);
              btn.setLabel("Loop (Queue)");
            }
          });
          break;
        }

        case "music_shuffle":
          if (player.queue.length === 0) {
            return interaction.reply({
              content: "❌ The queue is empty.",
              flags: MessageFlags.Ephemeral,
            });
          }
          player.queue.shuffle();
          await interaction.reply({
            content: "🔀 Queue shuffled!",
            flags: MessageFlags.Ephemeral,
          });
          break;

        case "music_autoplay": {
          const isAutoplay = player.data.get("autoplay") ?? false;
          const newState = !isAutoplay;
          player.data.set("autoplay", newState);

          await updateButtonState("music_autoplay", (btn) => {
            btn.setStyle(
              newState ? ButtonStyle.Success : ButtonStyle.Secondary,
            );
          });
          break;
        }
      }
    }
  }
}
