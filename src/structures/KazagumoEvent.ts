import AurisClient from "./Client";

export default abstract class KazagumoEvent {
  client: AurisClient;
  name: string;

  constructor(client: AurisClient, name: string) {
    this.client = client;
    this.name = name;
  }

  abstract execute(...args: any[]): Promise<any>;
}
