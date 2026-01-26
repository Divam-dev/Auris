import "dotenv/config";
import AurisClient from "./structures/Client";

const client = new AurisClient();
client.start();
