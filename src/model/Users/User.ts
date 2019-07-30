import { Typegoose } from "typegoose";
import { idProp } from "../../util/mongo";

export class User extends Typegoose {
  @idProp()
  _id!: string;
}
