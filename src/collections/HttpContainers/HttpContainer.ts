import { prop } from "@typegoose/typegoose";
import { idProp, ModelInit } from "../../util/mongo";

export class HttpContainer {
  @idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  hostname!: string;

  @prop({ required: true })
  path!: string;

  @prop({ required: true })
  certificateExpiresAt!: Date;

  constructor(init?: ModelInit<HttpContainer>) {
    Object.assign(this, init);
  }
}
