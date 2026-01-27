import fs from "fs";
import path from "path";
import AurisClient from "../structures/Client";
import Event from "../structures/Event";

export default class EventHandler {
  constructor(private client: AurisClient) {}

  public load() {
    const eventsPath = path.join(__dirname, "../events");
    if (!fs.existsSync(eventsPath)) return;

    const files = fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(eventsPath, file);
      const { default: EventClass } = require(filePath);

      if (EventClass && EventClass.prototype instanceof Event) {
        const event = new EventClass(this.client);

        if (event.once) {
          this.client.once(event.name, (...args) => event.execute(...args));
        } else {
          this.client.on(event.name, (...args) => event.execute(...args));
        }
      }
    }
  }
}
