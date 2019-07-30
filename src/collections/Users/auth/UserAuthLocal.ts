import { prop } from "typegoose";

export class UserAuthLocal {
  @prop({ required: true })
  passwordHash!: string;

  @prop({ required: true })
  salt!: string;

  @prop()
  resetToken?: string;
}
