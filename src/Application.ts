import { Service } from "typedi";
import { DatabaseService } from "./service/DatabaseService";
import { MongoService } from "./service/MongoService";

@Service()
export class Application {
  constructor(
    private db: DatabaseService,
    private mongo: MongoService
  ) { }

  public async start(): Promise<void> {
    await this.mongo.init();
    this.db.init();
  }
}
