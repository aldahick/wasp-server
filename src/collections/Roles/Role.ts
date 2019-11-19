import { arrayProp, prop, Typegoose } from "typegoose";
import { idProp, ModelInit } from "../../util/mongo";
import { Permission } from "../shared/Permission";

export class Role extends Typegoose {
  @idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @arrayProp({ required: true, items: String })
  permissions!: Permission[];

  constructor(init?: ModelInit<Role>) {
    super();
    Object.assign(this, init);
  }
}
