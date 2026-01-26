import AurisClient from "./Client";

export default abstract class Event {
  client: AurisClient;
  name: string;
  once: boolean;

  constructor(client: AurisClient, name: string, once: boolean = false) {
    this.client = client;
    this.name = name;
    this.once = once;
  }

  abstract execute(...args: any[]): Promise<any>;
}
