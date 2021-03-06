import { prop } from "@typegoose/typegoose";
import { UserStoryProfile } from "./UserStoryProfile";

export class UserProfile {
  @prop()
  firstName?: string;

  @prop()
  lastName?: string;

  @prop({ _id: false })
  story?: UserStoryProfile;
}
