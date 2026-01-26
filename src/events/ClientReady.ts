import Event from "../structures/Event";
import AurisClient from "../structures/Client";

export default class ClientReady extends Event {
  constructor(client: AurisClient) {
    super(client, "clientReady", true);
  }

  async execute() {
    console.log(`🚀 Logged in as ${this.client.user?.tag}`);

    this.client.kazagumo.shoukaku.on("ready", (name) =>
      console.log(`🎵 Node "${name}" Connected!`),
    );
    this.client.kazagumo.shoukaku.on("error", (name, error) =>
      console.error(`❌ Node "${name}" Error:`, error),
    );
  }
}
