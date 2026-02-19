import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Connectors } from "shoukaku";
import { Kazagumo } from "kazagumo";
import CommandHandler from "../handlers/CommandHandler";
import EventHandler from "../handlers/EventHandler";
import KazagumoHandler from "../handlers/KazagumoHandler";
import Command from "./Command";
import { logger } from "./Logger";

export default class AurisClient extends Client {
  commands: Collection<string, Command>;
  kazagumo: Kazagumo;

  public logger = logger;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    this.commands = new Collection();

    this.kazagumo = new Kazagumo(
      {
        defaultSearchEngine: "youtube_music",
        send: (guildId, payload) => {
          const guild = this.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
      },
      new Connectors.DiscordJS(this),
      [
        {
          name: "LocalNode",
          url: "localhost:2333",
          auth: "youshallnotpass",
          secure: false,
        },
      ],
      {
        reconnectTries: Infinity,
        reconnectInterval: 30,
        restTimeout: 60,
        moveOnDisconnect: false,
        resume: false,
      },
    );

    this.kazagumo.shoukaku.on("ready", (name) => {
      this.logger.start(`Lavalink Node "${name}" Connected`);
    });

    this.kazagumo.shoukaku.on("error", (name, error) => {
      if (error.message.includes("ECONNREFUSED")) {
        this.logger.error(
          `Node "${name}" Connection Refused (Is Lavalink running?)`,
        );
      } else {
        this.logger.error(`Node "${name}" Error:`, error);
      }
    });

    this.kazagumo.shoukaku.on("disconnect", (name, count) => {
      this.logger.warn(`Node "${name}" Disconnected`);

      const players = [...this.kazagumo.players.values()].filter(
        (p) => p.shoukaku.node.name === name,
      );

      if (players.length > 0) {
        this.logger.warn(`Cleaning up ${players.length} orphaned players...`);
        players.forEach((player) => player.destroy());
      }
    });

    this.kazagumo.shoukaku.on("reconnecting", (name) => {
      this.logger.warn(`Node "${name}" Reconnecting...`);
    });
  }

  async start() {
    new CommandHandler(this).load();
    this.logger.info("Successfully loaded commands!");

    new EventHandler(this).load();
    this.logger.info("Successfully loaded events!");

    new KazagumoHandler(this).load();
    this.logger.info("Successfully loaded player events!");

    await this.login(process.env.DISCORD_TOKEN);

    this.logger.success(`${this.user?.tag} is ready!`);
  }
}
