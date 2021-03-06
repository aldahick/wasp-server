import { ApolloError, gql } from "apollo-server-core";
import * as _ from "lodash";
import { Permission } from "../collections/shared/Permission";
import { User, UserStoryProfile } from "../collections/Users";
import { Context } from "../lib/Context";
import { Story, StoryCategory, StoryManager, StorySearchResult } from "../manager/StoryManager";
import { mutation, query, Resolver, resolver } from "./Resolver";

@Resolver.Service()
export class StoryResolver extends Resolver {
  queries = gql`
    type Query {
      story(id: Int!): Story!
      storiesByCategory(categoryId: Int!, page: Int): StoriesResult!
      storiesBySeries(seriesId: Int!, page: Int): StoriesResult!
      favoriteStories(page: Int): StoriesResult!
      storyCategories: [StoryCategory!]!
    }
  `;
  mutations = gql`
    type Mutation {
      createStoryProfile(username: String!, password: String!): Boolean!
      toggleStoryFavorite(id: Int!): Boolean!
    }
  `;
  types = gql`
    type StoryCategory {
      id: Int!
      name: String!
      description: String!
      code: String!
    }
    type StorySeries {
      id: Int!
      stories: [Story!]!
    }
    type Story {
      id: Int!
      categoryId: Int
      title: String!
      description: String!
      body: String
      series: StorySeries
    }

    type StoriesResult {
      pageCount: Int!
      stories: [Story!]!
    }
  `;

  constructor(
    private storyManager: StoryManager
  ) { super(); }

  @query("storyCategories")
  async categories(root: void, args: void, context: Context): Promise<StoryCategory[]> {
    return _.sortBy(await this.storyManager.getCategories(await this.getUser(context)), c => c.name);
  }

  @query()
  async storiesByCategory(root: void, { categoryId, page = 1 }: { categoryId: number; page?: number }, context: Context) {
    return this.storyManager.getByCategory(await this.getUser(context), categoryId, page);
  }

  @query()
  async storiesBySeries(root: void, { seriesId, page = 1 }: { seriesId: number; page?: number }, context: Context): Promise<StorySearchResult> {
    // We get this as a list, paginate it for GQL consumption
    const pages = _.chunk(await this.storyManager.getSeries(await this.getUser(context), seriesId), 10);
    return {
      pageCount: pages.length,
      stories: pages[page - 1]
    };
  }

  @query()
  async favoriteStories(root: void, { page = 1 }: { page?: number }, context: Context) {
    return this.storyManager.getFavorites(await this.getUser(context), page);
  }

  @query()
  async story(root: void, { id }: { id: number }, context: Context) {
    return this.storyManager.get(await this.getUser(context), id);
  }

  @mutation()
  async toggleStoryFavorite(root: void, { id }: { id: number }, context: Context): Promise<boolean> {
    return this.storyManager.toggleFavorite(await this.getUser(context), id);
  }

  @mutation()
  async createStoryProfile(root: void, profile: Pick<UserStoryProfile, "username" | "password">, context: Context): Promise<boolean> {
    await this.storyManager.createProfile(await this.getUser(context), profile);
    return true;
  }

  @resolver("Story.series")
  async seriesId(root: Story, args: void, context: Context) {
    return root.seriesId && { id: root.seriesId };
  }

  @resolver("StorySeries.stories")
  async seriesStories({ id }: { id: number }, args: void, context: Context) {
    if (!id) {
      return undefined;
    }
    return this.storyManager.getSeries(await this.getUser(context), id);
  }

  private async getUser(context: Context): Promise<User> {
    if (!context.hasPermission(Permission.Stories)) {
      throw new ApolloError("not allowed");
    }
    const user = await context.user();
    if (!user) {
      throw new ApolloError("requires a user token");
    }
    return user;
  }
}
