import {
  Interaction,
  GuildMember,
  Message,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonComponent,
  ComponentType,
  ActionRow,
  StringSelectMenuBuilder,
  StringSelectMenuComponent,
} from "discord.js";
import Event from "../structures/Event";
import AurisClient from "../structures/Client";
import {
  applyFilterPreset,
  isFilterPresetId,
  updateMessageFilterRow,
} from "../commands/filters/Filters";

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

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "filter_select"
    ) {
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
      if (!player || !player.queue.current) {
        return interaction.reply({
          content: "❌ No music is currently playing.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const presetId = interaction.values[0];
      if (!isFilterPresetId(presetId)) {
        return interaction.reply({
          content: "❌ That filter is not available.",
          flags: MessageFlags.Ephemeral,
        });
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      try {
        const reply = await applyFilterPreset(player, presetId);

        // Keep the menu the user picked from in sync as well. The now
        // playing message is already refreshed by applyFilterPreset.
        const nowPlayingMessage = player.data.get("nowPlayingMessage") as
          | Message
          | undefined;
        if (
          !nowPlayingMessage ||
          interaction.message.id !== nowPlayingMessage.id
        ) {
          try {
            await updateMessageFilterRow(
              interaction.message as Message,
              player,
            );
          } catch (e) {}
        }

        return interaction.editReply({ content: reply });
      } catch (error) {
        this.client.logger.error("Could not apply audio filter", error);
        return interaction.editReply({
          content: "❌ Could not apply that filter. Please try again.",
        });
      }
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

        const newComponents = btnInteraction.message.components.map((row) => {
          const actionRow = row as ActionRow<
            ButtonComponent | StringSelectMenuComponent
          >;
          const newActionRow = new ActionRowBuilder<
            ButtonBuilder | StringSelectMenuBuilder
          >();

          actionRow.components.forEach((component) => {
            if (component.type === ComponentType.Button) {
              const button = ButtonBuilder.from(component);

              if (component.customId === customIdToChange) {
                modifier(button);
              }
              newActionRow.addComponents(button);
            }

            if (component.type === ComponentType.StringSelect) {
              newActionRow.addComponents(StringSelectMenuBuilder.from(component));
            }
          });

          return newActionRow;
        });

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
