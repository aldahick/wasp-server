import { ForbiddenError, gql } from "apollo-server-core";
import { Context } from "../lib/Context";
import { MediaItem, MediaItemType, MediaManager } from "../manager/MediaManager";
import { query, Resolver } from "./Resolver";

@Resolver.Service()
export class MediaResolver extends Resolver {
  queries = gql`
    type Query {
      listMedia(dir: String!): [MediaItem]!
    }
  `;
  types = gql`
    type MediaItem {
      key: String!
      type: MediaItemType!
    }
    enum MediaItemType {
      ${Object.values(MediaItemType)}
    }
  `;
  constructor(
    private mediaManager: MediaManager
  ) { super(); }

  @query()
  async listMedia(root: void, { dir }: { dir: string }, context: Context): Promise<MediaItem[]> {
    const user = await context.user();
    if (!user) {
      throw new ForbiddenError("missing user");
    }
    return this.mediaManager.list(user._id, dir);
  }
}
