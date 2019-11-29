import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as crypto from "crypto";
import * as _ from "lodash";
import { Service } from "typedi";
import { resolve as resolveUrl } from "url";
import { User, UserStoryProfile } from "../../collections/Users";
import { ConfigService } from "../../service/ConfigService";
import { DatabaseService } from "../../service/DatabaseService";
import { SearchedStory, SingleStory } from "./Story";
import { StoryCategory } from "./StoryCategory";
import { StorySearchResult } from "./StorySearchResult";

@Service()
export class StoryManager {
  constructor(
    private config: ConfigService,
    private db: DatabaseService
  ) { }

  async createProfile(user: User, { username, password }: UserStoryProfile): Promise<void> {
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $set: {
        "profile.story.username": username,
        "profile.story.password": crypto.createHash("md5").update(password).digest("hex")
      }
    }).exec();
  }

  async getCategories(user: User): Promise<StoryCategory[]> {
    return this.fetch<StoryCategory[]>(user, "get", "/v1/categories");
  }

  async getFavorites(user: User, page: number): Promise<StorySearchResult> {
    return this.fetch<StorySearchResult>(user, "GET", `/v1/stories/favorites/${page}`);
  }

  async getByCategory(user: User, categoryId: number, page: number) {
    return this.fetch<StorySearchResult>(user, "GET", `/v1/stories/random/${categoryId}/${page}`);
  }

  async get(user: User, id: number): Promise<SingleStory> {
    return this.fetch<SingleStory>(user, "GET", `/v1/stories/${id}`);
  }

  async getSeries(user: User, id: number): Promise<SearchedStory[]> {
    const { stories } = await this.fetch<StorySearchResult>(user, "GET", `/v1/series/${id}`);
    return stories;
  }

  async toggleFavorite(user: User, id: number): Promise<void> {
    await this.fetch(user, "POST", `/v1/stories/${id}/favorite`);
  }

  public async refreshToken(user: User): Promise<string> {
    if (!this.config.storyApiUrl) {
      throw new Error("missing story API url");
    }
    if (!user.profile.story) {
      throw new Error("missing story profile");
    }
    const oldExpiresAt = user.profile.story?.tokenExpiresAt;
    if (user.profile.story.token && oldExpiresAt && oldExpiresAt?.getTime() < Date.now()) {
      return user.profile.story.token;
    }
    const { data: { token, expiresAt } } = await axios.post<any, AxiosResponse<{ token: string; expiresAt: string; }>>(
      resolveUrl(this.config.storyApiUrl, "/v1/token"), {
        username: user.profile.story.username,
        password: user.profile.story.password
      });
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $set: {
        "profile.story.token": token,
        "profile.story.expiresAt": new Date(expiresAt)
      }
    }).exec();
    return token;
  }

  private async fetch<Result>(user: User, method: AxiosRequestConfig["method"], route: string, options: Partial<AxiosRequestConfig> = { }) {
    if (!this.config.storyApiUrl) {
      throw new Error("missing story API url");
    }
    const url = resolveUrl(this.config.storyApiUrl, route);
    const res = await axios({
      url, method,
      headers: {
        Authorization: `bearer ${await this.refreshToken(user)}`
      }
    }) as AxiosResponse<Result>;
    return res.data;
  }
}
