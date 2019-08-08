import { ForbiddenError, gql } from "apollo-server-core";
import { Service } from "typedi";
import { Context } from "../lib/Context";
import { MediaItem, MediaManager } from "../manager/MediaManager";
import { Resolver, resolver } from "./Resolver";

@Service({ id: Resolver.token, multiple: true })
export class MediaResolver extends Resolver {
  query = gql`
    type Query {
      listMedia(dir: String!): [MediaItem]!
    }
  `;
  types = gql`
    type MediaItem {
      key: String!
      isFile: Boolean!
    }
  `;
  constructor(
    private mediaManager: MediaManager
  ) { super(); }

  @resolver("Query.listMedia")
  async listMedia(root: void, { dir }: { dir: string }, context: Context): Promise<MediaItem[]> {
    const user = await context.user();
    if (!user) {
      throw new ForbiddenError("missing user");
    }
    return this.mediaManager.list(user._id, dir);
  }
}
