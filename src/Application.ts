import * as http from "http";
import * as path from "path";
import { ApolloServer } from "apollo-server-express";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import * as cors from "cors";
import * as express from "express";
import * as requireAll from "require-all";
import { Service } from "typedi";
import { Controller } from "./controller/Controller";
import { Context } from "./lib/Context";
import { Resolver } from "./resolver/Resolver";
import { ConfigService } from "./service/ConfigService";
import { DatabaseService } from "./service/DatabaseService";
import { LoggingService } from "./service/LoggingService";
import { MongoService } from "./service/MongoService";

@Service()
export class Application {
  private apollo!: ApolloServer;
  private express = express();
  private http = http.createServer(this.express);

  constructor(
    private config: ConfigService,
    private db: DatabaseService,
    private logger: LoggingService,
    private mongo: MongoService
  ) { }

  async start(): Promise<void> {
    await this.mongo.init();
    this.logger.info("start", "Connected to MongoDB");
    this.db.init();
    this.logger.info("start", "Initialized database collections");
    this.express.use(cors({ }));
    this.setupApollo();
    this.setupControllers();
    await new Promise(resolve => this.http.listen(this.config.httpPort, resolve));
    this.logger.info("start", "HTTP server started");
  }

  private setupApollo() {
    requireAll(path.resolve(__dirname, "./resolver"));
    const { resolvers, schema } = Resolver.getAll();
    this.apollo = new ApolloServer({
      typeDefs: schema,
      resolvers,
      context: ({ req }: ExpressContext) => new Context(req)
    });
    this.apollo.applyMiddleware({ app: this.express });
  }

  private setupControllers() {
    requireAll(path.resolve(__dirname, "./controller"));
    Controller.setup(this.express);
  }
}
