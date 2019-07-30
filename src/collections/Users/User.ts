import { arrayProp, prop, Typegoose } from "typegoose";
import { idProp } from "../../util/mongo";
import { Permission } from "../shared/Permission";
import { UserAuth } from "./auth/UserAuth";
import { UserProfile } from "./UserProfile";

export class User extends Typegoose {
  @idProp()
  _id!: string;

  @prop({ required: true, _id: true })
  auth!: UserAuth;

  @prop({ required: true })
  email!: string;

  @arrayProp({ required: true, items: String })
  permissions!: Permission[];

  @prop({ required: true, _id: false })
  profile!: UserProfile;
}
