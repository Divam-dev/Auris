import {
  ActionRow,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  Message,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuComponent,
} from "discord.js";
import { FilterOptions } from "shoukaku";
import { KazagumoPlayer } from "kazagumo";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export type FilterPresetId =
  | "bass_boost"
  | "eight_d"
  | "nightcore"
  | "vaporwave"
  | "karaoke"
  | "reset";

type FilterPreset = {
  label: string;
  description: string;
  emoji: string;
  filters?: FilterOptions;
};

export const FILTER_PRESETS: Record<FilterPresetId, FilterPreset> = {
  bass_boost: {
    label: "Bass Boost",
    description: "Enhance low frequencies",
    emoji: "🔊",
    filters: {
      equalizer: [
        { band: 0, gain: 0.6 },
        { band: 1, gain: 0.5 },
        { band: 2, gain: 0.4 },
        { band: 3, gain: 0.3 },
        { band: 4, gain: 0.2 },
        { band: 5, gain: 0.1 },
      ],
    },
  },
  eight_d: {
    label: "8D",
    description: "Rotate sound between stereo channels",
    emoji: "🎧",
    filters: {
      rotation: { rotationHz: 0.2 },
    },
  },
  nightcore: {
    label: "Nightcore",
    description: "Increase speed and pitch",
    emoji: "⚡",
    filters: {
      timescale: { speed: 1.25, pitch: 1.3, rate: 1 },
    },
  },
  vaporwave: {
    label: "Vaporwave",
    description: "Reduce speed and pitch",
    emoji: "🌊",
    filters: {
      timescale: { speed: 0.8, pitch: 0.8, rate: 1 },
    },
  },
  karaoke: {
    label: "Karaoke",
    description: "Reduce vocal frequencies",
    emoji: "🎤",
    filters: {
      karaoke: {
        level: 1,
        monoLevel: 1,
        filterBand: 220,
        filterWidth: 100,
      },
    },
  },
  reset: {
    label: "Reset",
    description: "Restore the normal sound",
    emoji: "♻️",
  },
};

export function isFilterPresetId(value: string): value is FilterPresetId {
  return Object.hasOwn(FILTER_PRESETS, value);
}

export function getActiveFilter(
  player: KazagumoPlayer,
): FilterPresetId | undefined {
  return player.data.get("activeFilter") as FilterPresetId | undefined;
}

export function createFilterMenu(activeFilter?: FilterPresetId | null) {
  const active =
    activeFilter && isFilterPresetId(activeFilter)
      ? FILTER_PRESETS[activeFilter]
      : null;

  return new StringSelectMenuBuilder()
    .setCustomId("filter_select")
    .setPlaceholder(
      active
        ? `Current filter: ${active.emoji} ${active.label}`
        : "Choose a filter",
    )
    .addOptions(
      Object.entries(FILTER_PRESETS).map(([value, preset]) => ({
        label: preset.label,
        value,
        description: preset.description,
        emoji: preset.emoji,
        default: activeFilter === value,
      })),
    );
}

export async function updateMessageFilterRow(
  message: Message,
  player: KazagumoPlayer,
): Promise<void> {
  const newComponents = message.components.map(
    (row, index): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder> => {
      const actionRow = row as ActionRow<
        ButtonComponent | StringSelectMenuComponent
      >;
      const first = actionRow.components[0];

      if (
        index === 0 &&
        first?.type === ComponentType.StringSelect &&
        first.customId === "filter_select"
      ) {
        return new ActionRowBuilder<
          ButtonBuilder | StringSelectMenuBuilder
        >().addComponents(createFilterMenu(getActiveFilter(player)));
      }

      const newActionRow = new ActionRowBuilder<
        ButtonBuilder | StringSelectMenuBuilder
      >();

      actionRow.components.forEach((component) => {
        if (component.type === ComponentType.Button) {
          newActionRow.addComponents(ButtonBuilder.from(component));
        }

        if (component.type === ComponentType.StringSelect) {
          newActionRow.addComponents(StringSelectMenuBuilder.from(component));
        }
      });

      return newActionRow;
    },
  );

  await message.edit({ components: newComponents });
}

export async function applyFilterPreset(
  player: KazagumoPlayer,
  presetId: FilterPresetId,
): Promise<string> {
  const preset = FILTER_PRESETS[presetId];

  await player.shoukaku.clearFilters();

  if (preset.filters) {
    await player.shoukaku.setFilters(preset.filters);
    player.data.set("activeFilter", presetId);
  } else {
    player.data.delete("activeFilter");
  }

  try {
    const nowPlayingMessage = player.data.get("nowPlayingMessage") as
      | Message
      | undefined;
    if (nowPlayingMessage) {
      await updateMessageFilterRow(nowPlayingMessage, player);
    }
  } catch (e) {
    // The now playing message may already be gone; a fresh one is posted
    // with every new track.
  }

  return presetId === "reset"
    ? "♻️ Audio filters have been reset."
    : `${preset.emoji} **${preset.label}** filter enabled for the current track.`;
}

export default class Filters extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("filter")
        .setDescription("Choose an audio filter for the current track")
        .addStringOption((o) =>
          o
            .setName("preset")
            .setDescription("Filter preset")
            .setRequired(false)
            .addChoices(
              ...Object.entries(FILTER_PRESETS).map(([value, preset]) => ({
                name: preset.label,
                value,
              })),
            ),
        ),
    );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const player = await Utils.isPlaying(this.client, interaction);
    if (!player) return;

    const presetId = interaction.options.getString("preset");

    if (presetId) {
      if (!isFilterPresetId(presetId)) {
        return interaction.reply({
          content: "❌ That filter is not available.",
          flags: MessageFlags.Ephemeral,
        });
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      try {
        const message = await applyFilterPreset(player, presetId);

        return interaction.editReply({
          embeds: [new EmbedBuilder().setColor("Green").setDescription(message)],
        });
      } catch (error) {
        this.client.logger.error("Could not apply audio filter", error);
        return interaction.editReply({
          content: "❌ Could not apply that filter. Please try again.",
        });
      }
    }

    const controls = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("music_prev")
        .setEmoji("⏮️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("music_pause")
        .setEmoji(player.paused ? "▶️" : "⏸️")
        .setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("music_skip")
        .setEmoji("⏭️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("music_stop")
        .setEmoji("⏹️")
        .setStyle(ButtonStyle.Danger),
    );

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("DarkButNotBlack")
          .setDescription("Enjoy your listening experience!"),
      ],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          createFilterMenu(getActiveFilter(player)),
        ),
        controls,
      ],
    });
  }
}
