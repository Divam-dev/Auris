import { logger } from "../structures/Logger";

export class AntiCrash {
  public init() {
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection:", promise, "Reason:", reason);
    });

    process.on("uncaughtException", (err) => {
      logger.error("Uncaught Exception:", err);
    });

    process.on("uncaughtExceptionMonitor", (err, origin) => {
      logger.error("Uncaught Exception Monitor:", err, origin);
    });

    logger.success("AntiCrash module loaded.");
  }
}
