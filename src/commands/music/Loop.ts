import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
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
    let resultMode = "";

    if (mode) {
      player.setLoop(mode as "none" | "track" | "queue");
      resultMode = mode;
    } else {
      const modes = ["none", "track", "queue"] as const;
      const nextMode = modes[(modes.indexOf(player.loop) + 1) % modes.length];
      player.setLoop(nextMode);
      resultMode = nextMode;
    }

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`🔁 Loop set to: **${resultMode}**`);

    return interaction.reply({ embeds: [embed] });
  }
}
