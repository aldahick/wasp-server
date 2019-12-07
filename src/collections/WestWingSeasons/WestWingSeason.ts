import { prop } from "@typegoose/typegoose";

export class WestWingSeason {
  @prop({ required: true })
  _id!: number;
}
