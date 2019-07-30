import { prop } from "typegoose";

export class UserProfile {
  @prop()
  firstName?: string;

  @prop()
  lastName?: string;
}