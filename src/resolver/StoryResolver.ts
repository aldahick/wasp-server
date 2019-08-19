import { ApolloError, gql } from "apollo-server-core";
import Container, { Service } from "typedi";
import { Permission } from "../collections/shared/Permission";
import { StoryCategory } from "../collections/Stories";
import { User } from "../collections/Users";
import { Context } from "../lib/Context";
import { StoryManager } from "../manager/StoryManager";
import { Resolver, resolver } from "./Resolver";

@Service({ id: Resolver.token, multiple: true })
export class StoryResolver extends Resolver {
  query = gql`
    type Query {
      story(id: Int!): Story!
      stories(categoryId: Int, favorites: Boolean, page: Int): StoriesResult!
      storyCategories: [StoryCategory!]!
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

  @resolver("Query.stories")
  async stories(root: void, { categoryId, favorites, page = 0 }: { categoryId?: number, favorites?: boolean, page?: number }, context: Context) {
    if (!context.hasPermission(Permission.Stories)) {
      throw new ApolloError("not allowed");
    }
    if (!categoryId && !favorites) {
      throw new ApolloError("no filters");
    }
    return this.storyManager.searchStories(await context.user() as User, {
      categoryId, favorites, page
    });
  }

  @resolver("Query.story")
  async story(root: void, { id }: { id: number }, context: Context) {
    if (!context.hasPermission(Permission.Stories)) {
      throw new ApolloError("not allowed");
    }
    return this.storyManager.getStory(id);
  }
}
