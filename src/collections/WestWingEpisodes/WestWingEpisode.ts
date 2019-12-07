import { prop } from "@typegoose/typegoose";

export class WestWingEpisode {
  @prop({ required: true })
  _id!: number;

  @prop({ required: true })
  airedAt!: Date;

  @prop({ required: true })
  title!: string;

  /**
   * The episode number; N in (Season X, Episode N)
   */
  @prop({ required: true })
  number!: string;

  @prop({ required: true })
  seasonId!: number;

  @prop()
  transcript?: string;
}
