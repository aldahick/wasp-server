import { Model as MongooseModel } from "mongoose";
import { Service } from "typedi";
import { InstanceType as TypegooseInstanceType, Typegoose } from "typegoose";
import { User } from "../model/Users";
import { MongoService } from "./MongoService";

type TypegooseCollection<Model extends typeof Typegoose> = MongooseModel<TypegooseInstanceType<InstanceType<Model>>> & InstanceType<Model> & Model;

function collection<Model extends typeof Typegoose>(model: Model, name: string) {
  return (target: DatabaseService, key: keyof DatabaseService) => {
    Reflect.defineMetadata("collection", { name, model }, target, key);
    (target as any)[key] = true;
  };
}

@Service()
export class DatabaseService {
  @collection(User, "users") users!: TypegooseCollection<typeof User>;
  constructor(
    private mongo: MongoService
  ) { }

  init() {
    for (const key in this) {
      if (!Reflect.hasMetadata("collection", this, key)) { continue; }
      const metadata = Reflect.getMetadata("collection", this, key);
      (this as any)[key] = new (metadata.model as typeof Typegoose)().setModelForClass(metadata.model, {
        existingConnection: this.mongo.connection,
        schemaOptions: { collection: metadata.name }
      });
    }
  }
}
