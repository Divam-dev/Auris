import "dotenv/config";
import AurisClient from "./structures/Client";
import { AntiCrash } from "./handlers/AntiCrash";

const antiCrash = new AntiCrash();
antiCrash.init();

const client = new AurisClient();
client.start();
