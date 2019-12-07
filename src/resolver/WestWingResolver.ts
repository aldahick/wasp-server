import { gql } from "apollo-server-express";
import { WestWingEpisode } from "../collections/WestWingEpisodes";
import { WestWingSeason } from "../collections/WestWingSeasons";
import { WestWingManager } from "../manager/WestWingManager";
import { query, Resolver, resolver } from "./Resolver";

@Resolver.Service()
export class WestWingResolver extends Resolver {
  queries = gql`
    type Query {
      westWingEpisode(id: Int!): WestWingEpisode!
      westWingEpisodes(seasonId: Int!): [WestWingEpisode!]!
      westWingSeasons: [WestWingSeason!]!
    }
  `;
  types = gql`
    type WestWingSeason {
      _id: Int!
    }
    type WestWingEpisode {
      _id: Int!
      title: String!
      airedAt: Date!
      number: Int!
      season: WestWingSeason!
      transcript: String
    }
  `;

  constructor(
    private westWingManager: WestWingManager
  ) { super(); }

  @query("westWingEpisode")
  async episode(root: void, { id }: { id: number }): Promise<WestWingEpisode> {
    return this.westWingManager.getEpisode(id);
  }

  @query("westWingEpisodes")
  async episodes(root: void, { seasonId }: { seasonId: number }): Promise<WestWingEpisode[]> {
    return this.westWingManager.getEpisodes(seasonId);
  }

  @query("westWingSeasons")
  async seasons(): Promise<WestWingSeason[]> {
    return this.westWingManager.getSeasons();
  }

  @resolver("WestWingEpisode.season")
  async episodeSeason(root: WestWingEpisode): Promise<WestWingSeason> {
    return { _id: root.seasonId };
  }

  @resolver("WestWingEpisode.transcript")
  async episodeTranscript(root: WestWingEpisode): Promise<string | undefined> {
    if (root.transcript) {
      return root.transcript;
    }
    return this.westWingManager.getTranscript(root._id);
  }
}
