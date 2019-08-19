import { prop } from "typegoose";
import { idProp } from "../../util/mongo";

export enum StoryCategoryType {
  Story = "story",
  Illustration = "illustra",
  Poem = "poem"
}

export class StoryCategory {
  @idProp()
  _id!: number;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  description!: string;

  @prop({ required: true })
  code!: string;

  @prop({ required: true })
  type!: StoryCategoryType;
}
