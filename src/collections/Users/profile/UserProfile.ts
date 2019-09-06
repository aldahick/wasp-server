import { prop } from "typegoose";
import { UserLitProfile } from "./UserLitProfile";

export class UserProfile {
  @prop()
  firstName?: string;

  @prop()
  lastName?: string;

  @prop({ _id: false })
  lit?: UserLitProfile;
}
