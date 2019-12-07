import { resolve as resolveUrl } from "url";
import axios, { AxiosRequestConfig } from "axios";
import { Service } from "typedi";
import { WestWingEpisode } from "../../collections/WestWingEpisodes/WestWingEpisode";
import { WestWingSeason } from "../../collections/WestWingSeasons";
import { ConfigService } from "../../service/ConfigService";
import { DatabaseService } from "../../service/DatabaseService";

@Service()
export class WestWingManager {
  constructor(
    private config: ConfigService,
    private db: DatabaseService
  ) { }

  async getSeasons(): Promise<WestWingSeason[]> {
    const existingSeasons = await this.db.westWingSeasons.find().exec();
    if (existingSeasons.length > 0) {
      return existingSeasons;
    }
    const { seasonIds } = await this.fetch<{ seasonIds: number[] }>("GET", "/v1/seasons");
    return this.db.westWingSeasons.create(seasonIds.map(_id => ({ _id })));
  }

  async getEpisodes(seasonId: number): Promise<WestWingEpisode[]> {
    const existingEpisodes = await this.db.westWingEpisodes.find({ seasonId }).exec();
    if (existingEpisodes.length > 0) {
      return existingEpisodes;
    }
    const { episodes: rawEpisodes } = await this.fetch<{
      episodes: (WestWingEpisode & { id: number })[];
    }>("GET", `/v1/seasons/${seasonId}/episodes`);
    console.log(rawEpisodes);
    return this.db.westWingEpisodes.create(rawEpisodes.map(e => ({
      ...e,
      _id: e.id,
      airedAt: new Date(e.airedAt),
      seasonId
    })));
  }

  async getEpisode(id: number): Promise<WestWingEpisode> {
    const episode = await this.db.westWingEpisodes.findById(id).exec();
    if (!episode) {
      throw new Error(`episode id=${id} not found`);
    }
    return episode;
  }

  async getTranscript(episodeId: number): Promise<string | undefined> {
    const { transcript } = await this.fetch<{
      transcript?: string;
    }>("GET", `/v1/episodes/${episodeId}/transcript`);
    await this.db.westWingEpisodes.updateOne({
      _id: episodeId
    }, {
      $set: { transcript }
    }).exec();
    return transcript;
  }

  private async fetch<Result>(method: AxiosRequestConfig["method"], route: string): Promise<Result> {
    if (!this.config.westWingServiceUrl) {
      throw new Error("Missing WEST_WING_SERVICE_URL");
    }
    const { data } = await axios({
      url: resolveUrl(this.config.westWingServiceUrl, route),
      method
    });
    return data;
  }
}
