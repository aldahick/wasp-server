import { ForbiddenError, gql } from "apollo-server-core";
import { Context } from "../lib/Context";
import { MediaItem, MediaItemType, MediaManager } from "../manager/MediaManager";
import { mutation, query, Resolver } from "./Resolver";

@Resolver.Service()
export class MediaResolver extends Resolver {
  queries = gql`
    type Query {
      listMedia(dir: String!): [MediaItem!]!
    }
  `;
  mutations = gql`
    type Mutation {
      scrapeMedia(url: String!, destination: String!): [MediaItem!]!
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

  @mutation()
  async scrapeMedia(root: void, { url, destination }: { url: string; destination: string }, context: Context): Promise<MediaItem[]> {
    const user = await context.user();
    if (!user) {
      throw new ForbiddenError("missing user");
    }
    return (await this.mediaManager.scrape(url, user._id, destination)).map(key => ({
      key, type: MediaItemType.File
    }));
  }
}
