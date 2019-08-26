import * as _ from "lodash";
import Container from "typedi";
import { Story, StoryCategory } from "../../collections/Stories";
import { User } from "../../collections/Users";
import { LitApiService } from "../../service/LitApiService";
import { StorySearchResult } from "./StorySearchResult";

export class StoryManager {
  private litApiService = Container.get(LitApiService);

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
    if (!user.profile.litId) {
      throw new Error("no profile ID");
    }
    return this.search("/api/1/user-favorites", page, [{
      property: "user_id",
      value: user.profile.litId
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
    const { userId, sessionId } = await this.login(user);
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
      user_id: userId,
      session_id: sessionId
    }, { ignoreChecks: true });
    const body = res.pages.map(p => p.content).join("\n").replace(/\r/g, "");
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
    const { userId, sessionId } = await this.login(user);
    const { isFavorite } = await this.get(user, id);
    const url = `/api/2/favorites/submission-${isFavorite ? "remove" : "add"}`;
    await this.litApiService.fetch("POST", url, {
      user_id: userId,
      session_id: sessionId,
      submission_id: id
    }, { ignoreChecks: true });
  }

  async login(user?: User): Promise<{ userId?: number; sessionId?: string }> {
    if (!user || !user.profile.litUsername || !user.profile.litPassword) {
      return { };
    }
    const res = await this.litApiService.fetch("POST", "/api/2/auth/login", {
      username: user.profile.litUsername,
      password: user.profile.litPassword
    });
    return {
      userId: Number(res.login.user.user_id),
      sessionId: res.login.session_id
    };
  }
}
