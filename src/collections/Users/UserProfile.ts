import { prop } from "typegoose";

export class UserProfile {
  @prop()
  firstName?: string;

  @prop()
  lastName?: string;

  @prop()
  litId?: number;

  @prop()
  litUsername?: string;

  @prop()
  litPassword?: string;
}
