import { arrayProp, prop, Typegoose } from "typegoose";
import { idProp, ModelInit } from "../../util/mongo";
import { Permission } from "../shared/Permission";
import { UserAuth } from "./auth/UserAuth";
import { UserProfile } from "./profile/UserProfile";

export class User extends Typegoose {
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
    super();
    Object.assign(this, init);
  }
}
