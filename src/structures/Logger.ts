import { Signale } from "signale";

const DEBUG_MODE = process.env.DEBUG_MODE === "true";

class Logger extends Signale {
  constructor() {
    super({
      config: {
        displayTimestamp: true,
        displayDate: true,
        displayFilename: true,
      },
      scope: "Auris",
    });

    if (!DEBUG_MODE) {
      this.debug = () => {};
    }
  }
}

export const logger = new Logger();
