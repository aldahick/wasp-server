import { ApolloError, gql } from "apollo-server-core";
import Container, { Service } from "typedi";
import { Permission } from "../collections/shared/Permission";
import { StoryCategory } from "../collections/Stories";
import { Context } from "../lib/Context";
import { StoryManager } from "../manager/StoryManager";
import { Resolver, resolver } from "./Resolver";

@Service({ id: Resolver.token, multiple: true })
export class StoryResolver extends Resolver {
  query = gql`
    type Query {
      story(id: Int!): Story!
      storiesByCategory(categoryId: Int!, page: Int): StoriesResult!
      favoriteStories(page: Int): StoriesResult!
      randomStories(page: Int): StoriesResult!
      storyCategories: [StoryCategory!]!
    }
  `;
  mutation = gql`
    type Mutation {
      toggleStoryFavorite(id: Int!): Boolean!
    }
  `;
  types = gql`
    enum StoryCategoryType {
      story
      illustra
      poem
    }
    type StoryCategory {
      _id: Int!
      name: String!
      description: String!
      code: String!
      type: StoryCategoryType!
    }
    type Story {
      _id: Int!
      categoryId: Int!
      title: String!
      description: String!
      body: String!
      isFavorite: Boolean
    }

    type StoriesResult {
      pageCount: Int!
      stories: [Story!]!
    }
  `;

  private storyManager = Container.get(StoryManager);

  @resolver("Query.storyCategories")
  async categories(root: void, args: void, context: Context): Promise<StoryCategory[]> {
    if (!context.hasPermission(Permission.Stories)) {
      throw new ApolloError("not allowed");
    }
    return this.storyManager.getCategories();
  }

  @resolver("Query.storiesByCategory")
  async storiesByCategory(root: void, { categoryId, page = 0 }: { categoryId: number, page?: number }, context: Context) {
    if (!context.hasPermission(Permission.Stories)) {
      throw new ApolloError("not allowed");
    }
    return this.storyManager.getByCategory(categoryId, page);
  }

  @resolver("Query.favoriteStories")
  async favoriteStories(root: void, { page = 0 }: { page?: number }, context: Context) {
    const user = await context.user();
    if (!user) {
      throw new ApolloError("requires a user token");
    }
    if (!context.hasPermission(Permission.Stories)) {
      throw new ApolloError("not allowed");
    }
    return this.storyManager.getFavorites(user, page);
  }

  @resolver("Query.story")
  async story(root: void, { id }: { id: number }, context: Context) {
    if (!context.hasPermission(Permission.Stories)) {
      throw new ApolloError("not allowed");
    }
    return this.storyManager.get(await context.user(), id);
  }

  @resolver("Mutation.toggleStoryFavorite")
  async toggleStoryFavorite(root: void, { id }: { id: number }, context: Context): Promise<boolean> {
    const user = await context.user();
    if (!user) {
      throw new ApolloError("requires a user token");
    }
    if (!context.hasPermission(Permission.Stories)) {
      throw new ApolloError("not allowed");
    }
    await this.storyManager.toggleFavorite(user, id);
    return true;
  }
}
