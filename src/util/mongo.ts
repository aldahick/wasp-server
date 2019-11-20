import { prop } from "@typegoose/typegoose";
import { randomId } from "./random";

export function idProp(options: Omit<Parameters<typeof prop>[0], "default"> = { }) {
  return prop({
    default: randomId,
    ...options
  });
}

export type ModelInit<Model> = Omit<Model, "_id">;
