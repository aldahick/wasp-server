import { prop } from "typegoose";
import { randomId } from "./random";

export function idProp() {
  return prop({
    default: randomId
  });
}
