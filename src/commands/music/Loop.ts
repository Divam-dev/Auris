import { SlashCommandBuilder } from "discord.js";
import Command from "../../structures/Command";
import AurisClient from "../../structures/Client";
import { Utils } from "../../utils/Utils";

export default class Loop extends Command {
  constructor(client: AurisClient) {
    super(
      client,
      new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Toggle loop mode")
        .addStringOption((o) =>
          o
            .setName("mode")
            .setDescription("Mode")
            .setRequired(false)
            .addChoices(
              { name: "Off", value: "none" },
              { name: "Track", value: "track" },
              { name: "Queue", value: "queue" },
            ),
        ),
    );
  }

  async execute(interaction: any) {
    const member = await Utils.sameVoiceChannel(interaction);
    if (!member) return;

    const player = await Utils.isPlaying(this.client, interaction);
    if (!player) return;

    const mode = interaction.options.getString("mode");

    if (mode) {
      player.setLoop(mode as "none" | "track" | "queue");
      return interaction.reply(`🔁 Loop set to: **${mode}**`);
    }

    const modes = ["none", "track", "queue"] as const;
    const nextMode = modes[(modes.indexOf(player.loop) + 1) % modes.length];

    player.setLoop(nextMode);
    return interaction.reply(`🔁 Loop mode: **${nextMode}**`);
  }
}
