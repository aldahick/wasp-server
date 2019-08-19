import * as _ from "lodash";
import Container from "typedi";
import { Story, StoryCategory } from "../../collections/Stories";
import { User } from "../../collections/Users";
import { LitApiService } from "../../service/LitApiService";

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

  async searchStories(user: User, { categoryId, favorites, page }: { categoryId?: number; favorites?: boolean; page: number; }): Promise<{
    stories: Story[];
    pageCount: number;
  }> {
    let url = "/api/1/submissions";
    const filters: any[] = [];
    if (categoryId) {
      filters.push({
        property: "category_id",
        value: categoryId
      });
    }
    if (favorites) {
      if (!user.profile.litId) {
        throw new Error("no profile ID");
      }
      url = "/api/1/user-favorites";
      filters.push({
        property: "user_id",
        value: user.profile.litId
      }, {
        property: "type",
        value: "story"
      });
    }
    const res = await this.litApiService.fetch("GET", url, {
      page,
      filter: JSON.stringify(filters)
    }, { ignoreChecks: true });
    const stories = (res.submissions as any[]).map(s => new Story({
      _id: Number(s.id),
      categoryId: s.category_id,
      title: s.name,
      description: s.description,
      url: s.url
    }));
    return {
      stories,
      pageCount: res.meta.pages
    };
  }

  async getStory(id: number): Promise<Story> {
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
      }])
    }, { ignoreChecks: true });
    const body = res.pages.map(p => p.content).join("\n").replace(/\r/g, "");
    return new Story({
      _id: id,
      categoryId: 0,
      title: res.pages[0].name,
      url: res.pages[0].url,
      description: "",
      body
    });
  }
}
