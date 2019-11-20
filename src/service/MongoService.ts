import * as mongoose from "mongoose";
import { Service } from "typedi";
import { ConfigService } from "./ConfigService";

@Service()
export class MongoService {
  private _connection?: mongoose.Connection;

  constructor(
    private config: ConfigService
  ) { }

  async init() {
    this._connection = (await mongoose.connect(this.config.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })).connection;
  }

  public get connection() {
    if (!this._connection) {
      throw new Error("Mongo connection accessed before init()");
    }
    return this._connection;
  }
}
