import { arrayProp, prop } from "@typegoose/typegoose";
import { idProp, ModelInit } from "../../util/mongo";
import { Permission } from "../shared/Permission";
import { UserAuth } from "./auth/UserAuth";
import { UserProfile } from "./profile/UserProfile";

export class User {
  @idProp()
  _id!: string;

  @prop({ required: true, _id: false })
  auth!: UserAuth;

  @prop({ required: true })
  createdAt!: Date;

  @prop({ required: true })
  email!: string;

  @arrayProp({ required: true, items: String })
  permissions!: Permission[];

  @prop({ required: true, _id: false })
  profile!: UserProfile;

  @arrayProp({ required: true, items: String })
  roleIds!: string[];

  constructor(init?: ModelInit<User>) {
    Object.assign(this, init);
  }
}
