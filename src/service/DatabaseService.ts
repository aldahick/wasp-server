import { getModelForClass, ReturnModelType, setGlobalOptions } from "@typegoose/typegoose";
import { Service } from "typedi";
import { Role } from "../collections/Roles";
import { User } from "../collections/Users";
import { MongoService } from "./MongoService";

function collection<Model>(model: Model, name: string) {
  return (target: DatabaseService, key: keyof DatabaseService) => {
    Reflect.defineMetadata("collection", { name, model }, target, key);
    (target as any)[key] = true;
  };
}

@Service()
export class DatabaseService {

  @collection(Role, "roles") roles!: ReturnModelType<typeof Role>;
  @collection(User, "users") users!: ReturnModelType<typeof User>;

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
