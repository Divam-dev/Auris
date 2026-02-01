import fs from "fs";
import path from "path";
import AurisClient from "../structures/Client";
import KazagumoEvent from "../structures/KazagumoEvent";

export default class KazagumoHandler {
  constructor(private client: AurisClient) {}

  public load() {
    const eventsPath = path.join(__dirname, "../events/kazagumo");

    if (!fs.existsSync(eventsPath)) return;

    const files = fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(eventsPath, file);
      const { default: EventClass } = require(filePath);

      if (EventClass && EventClass.prototype instanceof KazagumoEvent) {
        const event = new EventClass(this.client);
        this.client.kazagumo.on(event.name, (...args) =>
          event.execute(...args),
        );
      }
    }
  }
}
