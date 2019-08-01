import { prop, Typegoose } from "typegoose";
import { randomId } from "./random";

export function idProp() {
  return prop({
    default: randomId
  });
}

export type ModelInit<Model extends Typegoose> = Omit<Model, "_id" | keyof Typegoose>;
