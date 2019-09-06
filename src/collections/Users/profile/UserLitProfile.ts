import { prop } from "typegoose";

export class UserLitProfile {
  @prop({ required: true })
  userId!: number;

  @prop({ required: true })
  username!: string;

  @prop({ required: true })
  password!: string;

  @prop()
  sessionId?: string;

  @prop()
  sessionExpiresAt?: Date;
}
