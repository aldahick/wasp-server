import { prop, Typegoose } from "typegoose";
import { randomId } from "./random";

export function idProp(options: Omit<Parameters<typeof prop>[0], "default"> = { }) {
  return prop({
    default: randomId,
    ...options
  });
}

export type ModelInit<Model extends Typegoose> = Omit<Model, "_id" | keyof Typegoose>;
