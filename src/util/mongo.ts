import { prop } from "@typegoose/typegoose";
import { randomId } from "./random";

export const idProp = (options: Omit<Parameters<typeof prop>[0], "default"> = { }) =>
  prop({
    default: randomId,
    ...options
  });

export type ModelInit<Model> = Omit<Model, "_id">;
