import { prop } from "@typegoose/typegoose";

export class UserStoryProfile {
  @prop({ required: true })
  username!: string;

  /**
   * Must be MD5 hash
   */
  @prop({ required: true })
  password!: string;

  @prop()
  token?: string;

  @prop()
  tokenExpiresAt?: Date;
}
