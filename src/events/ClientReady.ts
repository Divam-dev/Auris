import Event from "../structures/Event";
import AurisClient from "../structures/Client";

export default class ClientReady extends Event {
  constructor(client: AurisClient) {
    super(client, "clientReady", true);
  }

  async execute() {
    console.log(`🚀 Logged in as ${this.client.user?.tag}`);

    this.client.kazagumo.shoukaku.on("ready", (name) => {
      console.log(`🎵 Lavalink node "${name}" is ready!`);
    });

    this.client.kazagumo.shoukaku.on("reconnecting", (name) => {
      console.log(`🔄 Lavalink node "${name}" reconnecting...`);
    });

    this.client.kazagumo.shoukaku.on("close", (name, code, reason) => {
      console.log(`❌ Lavalink node "${name}" closed: [${code}] ${reason}`);
    });

    this.client.kazagumo.shoukaku.on("disconnect", (name, count) => {
      console.log(`🔌 Lavalink node "${name}" disconnected`);

      const players = [...this.client.kazagumo.players.values()].filter(
        (p) => p.shoukaku.node.name === name,
      );

      if (players.length > 0) {
        console.log(`🧹 Cleaning up ${players.length} orphaned players...`);

        players.forEach((player) => {
          try {
            player.destroy();
          } catch (error) {
            console.error(
              `Failed to clean up player for guild ${player.guildId}:`,
              error,
            );
          }
        });
      }
    });
  }
}
