import { arrayProp, prop, Typegoose } from "typegoose";
import { idProp } from "../../util/mongo";
import { Permission } from "../shared/Permission";

export class Role extends Typegoose {
  @idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @arrayProp({ required: true, items: String })
  permissions!: Permission[];
}
