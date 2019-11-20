import { arrayProp, prop } from "@typegoose/typegoose";
import { idProp, ModelInit } from "../../util/mongo";
import { Permission } from "../shared/Permission";

export class Role {
  @idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @arrayProp({ required: true, items: String })
  permissions!: Permission[];

  constructor(init?: ModelInit<Role>) {
    Object.assign(this, init);
  }
}
