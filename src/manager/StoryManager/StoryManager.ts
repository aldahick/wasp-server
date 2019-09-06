import * as _ from "lodash";
import { Service } from "typedi";
import { Story, StoryCategory } from "../../collections/Stories";
import { User } from "../../collections/Users";
import { ConfigService } from "../../service/ConfigService";
import { DatabaseService } from "../../service/DatabaseService";
import { LitApiService } from "../../service/LitApiService";
import { StorySearchResult } from "./StorySearchResult";

@Service()
export class StoryManager {
  constructor(
    private config: ConfigService,
    private db: DatabaseService,
    private litApiService: LitApiService
  ) { }

  async getCategories(): Promise<StoryCategory[]> {
    const categories = await this.litApiService.fetch("GET", "/api/3/tagsportal/categories", {
      language: 1
    }, { ignoreChecks: true }) as any[];
    return _.sortBy(categories.map(c => ({
      _id: c.id,
      name: c.name,
      description: c.ldesc,
      code: c.sdesc,
      type: c.type
    })), c => c.name);
  }

  async getFavorites(user: User, page: number): Promise<StorySearchResult> {
    if (!user.profile.lit) {
      throw new Error("no profile");
    }
    return this.search("/api/1/user-favorites", page, [{
      property: "user_id",
      value: user.profile.lit.userId
    }, {
      property: "type",
      value: "story"
    }]);
  }

  async getByCategory(categoryId: number, page: number) {
    return this.search("/api/1/submissions", page, [{
      property: "category_id",
      value: categoryId
    }, {
      property: "random",
      value: "yes"
    }]);
  }

  private async search(url: string, page: number, filters: { property: string; value: string | number }[]): Promise<{
    stories: Story[];
    pageCount: number;
  }> {
    const res = await this.litApiService.fetch("GET", url, {
      page,
      filter: JSON.stringify(filters)
    }, { ignoreChecks: true });
    const stories = (res.submissions as any[]).map(s => new Story({
      _id: Number(s.id),
      categoryId: s.category_id,
      title: s.name,
      description: s.description,
      url: s.url,
      isFavorite: false
    }));
    return {
      stories,
      pageCount: res.meta.pages
    };
  }

  async get(user: User | undefined, id: number): Promise<Story> {
    const sessionId = await this.getSessionId(user);
    const res: {
      pages: {
        id: number;
        name: string;
        series_id: number;
        content: string;
        is_favorited: boolean;
        url: string;
      }[];
    } = await this.litApiService.fetch("GET", "/api/2/submissions/pages", {
      filter: JSON.stringify([{
        property: "submission_id",
        value: id
      }]),
      user_id: user ? user.profile.lit!.userId : undefined,
      session_id: sessionId
    }, { ignoreChecks: true });
    const body = res.pages.map(p => p.content).join("\n").replace(/\r/g, "").replace(/src\=\"([^\"]+)\"/g, `src="${this.config.litApiUrl}$1"`);
    return new Story({
      _id: id,
      categoryId: 0,
      title: res.pages[0].name,
      url: res.pages[0].url,
      description: "",
      body,
      isFavorite: res.pages[0].is_favorited
    });
  }

  async toggleFavorite(user: User, id: number) {
    if (!user.profile.lit) {
      throw new Error("no lit profile");
    }
    const sessionId = await this.getSessionId(user);
    const { isFavorite } = await this.get(user, id);
    const url = `/api/2/favorites/submission-${isFavorite ? "remove" : "add"}`;
    await this.litApiService.fetch("POST", url, {
      user_id: user.profile.lit.userId,
      session_id: sessionId,
      submission_id: id
    }, { ignoreChecks: true });
  }

  async getSessionId(user?: User): Promise<string | undefined> {
    if (!user || !user.profile.lit) {
      return undefined;
    }
    const { username, password } = user.profile.lit;
    let { sessionExpiresAt, sessionId } = user.profile.lit;
    if (sessionId && sessionExpiresAt && sessionExpiresAt.getTime() > Date.now()) {
      return sessionId;
    }
    const res = await this.litApiService.fetch("POST", "/api/2/auth/login", {
      username,
      password
    });
    sessionId = res.login.session_id;
    sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 1);
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $set: {
        "profile.lit.sessionId": sessionId,
        "profile.lit.sessionExpiresAt": sessionExpiresAt
      }
    }).exec();
    return sessionId;
  }
}
