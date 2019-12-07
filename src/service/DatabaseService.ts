import { getModelForClass, ReturnModelType, setGlobalOptions } from "@typegoose/typegoose";
import { Service } from "typedi";
import { Role } from "../collections/Roles";
import { User } from "../collections/Users";
import { WestWingEpisode } from "../collections/WestWingEpisodes";
import { WestWingSeason } from "../collections/WestWingSeasons";
import { MongoService } from "./MongoService";

const collection = <Model>(model: Model, name: string) =>
  (target: DatabaseService, key: keyof DatabaseService) => {
    Reflect.defineMetadata("collection", { name, model }, target, key);
    (target as any)[key] = true;
  };

@Service()
export class DatabaseService {

  @collection(Role, "roles")
  roles!: ReturnModelType<typeof Role>;

  @collection(User, "users")
  users!: ReturnModelType<typeof User>;

  @collection(WestWingEpisode, "westWingEpisodes")
  westWingEpisodes!: ReturnModelType<typeof WestWingEpisode>;

  @collection(WestWingSeason, "westWingSeasons")
  westWingSeasons!: ReturnModelType<typeof WestWingSeason>;

  constructor(
    private mongo: MongoService
  ) { }

  init() {
    setGlobalOptions({
      globalOptions: {
        useNewEnum: true
      }
    });
    for (const key in this) {
      if (!Reflect.hasMetadata("collection", this, key)) { continue; }
      const metadata = Reflect.getMetadata("collection", this, key);
      (this as any)[key] = getModelForClass(metadata.model, {
        existingConnection: this.mongo.connection,
        schemaOptions: { collection: metadata.name }
      });
    }
  }
}
