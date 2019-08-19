import { prop, Typegoose } from "typegoose";
import { idProp, ModelInit } from "../../util/mongo";

export class Story extends Typegoose {
  @idProp()
  _id!: number;

  @prop({ required: true })
  categoryId!: number;

  @prop({ required: true })
  title!: string;

  @prop({ required: true })
  description!: string;

  @prop({ required: true })
  url!: string;

  @prop({ })
  body?: string;

  constructor(init?: ModelInit<Story> & { _id: number }) {
    super();
    Object.assign(this, init);
  }
}
