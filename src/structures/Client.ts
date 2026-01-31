import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Connectors } from "shoukaku";
import { Kazagumo } from "kazagumo";
import CommandHandler from "../handlers/CommandHandler";
import EventHandler from "../handlers/EventHandler";
import Command from "./Command";

export default class AurisClient extends Client {
  commands: Collection<string, Command>;
  kazagumo: Kazagumo;

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
        reconnectInterval: 10,
        restTimeout: 60,
        moveOnDisconnect: false,
        resume: false,
      },
    );

    this.kazagumo.shoukaku.on("error", (name, error) => {
      const isConnRefused =
        (error as any).code === "ECONNREFUSED" ||
        (error.name === "AggregateError" &&
          (error as any).errors?.some((e: any) => e.code === "ECONNREFUSED"));

      if (isConnRefused) {
        return;
      }

      console.error(`❌ Node "${name}" Error:`, error);
    });
  }

  async start() {
    new CommandHandler(this).load();
    new EventHandler(this).load();

    await this.login(process.env.DISCORD_TOKEN);
  }
}
