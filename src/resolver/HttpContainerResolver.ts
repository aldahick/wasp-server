import { ApolloError, gql } from "apollo-server-express";
import Container from "typedi";
import { HttpContainer } from "../collections/HttpContainers";
import { Permission } from "../collections/shared/Permission";
import { Context } from "../lib/Context";
import { HttpContainerManager } from "../manager/HttpContainerManager";
import { mutation, query, Resolver } from "./Resolver";

@Resolver.Service()
export class HttpContainerResolver extends Resolver {
  queries = gql`
    type Query {
      httpContainer(id: String!): HttpContainer
      httpContainers: [HttpContainer!]!
    }
  `;

  mutations = gql`
    type Mutation {
      createHttpContainer(
        name: String!,
        hostname: String!,
        path: String!
      ): HttpContainer!

      deleteHttpContainer(id: String!): Boolean!

      updateHttpContainer(
        id: String!,
        name: String,
        hostname: String,
        path: String
      ): HttpContainer!
    }
  `;

  types = gql`
    type HttpContainer {
      _id: String!
      name: String!
      hostname: String!
      path: String!
    }
  `;

  private httpContainerManager = Container.get(HttpContainerManager);

  @query()
  async httpContainer(root: void, { id }: { id: string }, context: Context): Promise<HttpContainer | null> {
    if (!await context.hasPermission(Permission.ManageHttpContainers)) {
      throw new ApolloError("not allowed");
    }
    return this.httpContainerManager.get(id);
  }

  @query()
  async httpContainers(root: void, args: void, context: Context): Promise<HttpContainer[]> {
    if (!await context.hasPermission(Permission.ManageHttpContainers)) {
      throw new ApolloError("not allowed");
    }
    return this.httpContainerManager.getAll();
  }

  @mutation()
  async createHttpContainer(
    root: void,
    args: Pick<HttpContainer, "name" | "hostname" | "path">,
    context: Context
  ): Promise<HttpContainer> {
    if (!await context.hasPermission(Permission.ManageHttpContainers)) {
      throw new ApolloError("not allowed");
    }
    return this.httpContainerManager.create(args);
  }

  @mutation()
  async deleteHttpContainer(root: void, { id }: { id: string }, context: Context): Promise<boolean> {
    if (!await context.hasPermission(Permission.ManageHttpContainers)) {
      throw new ApolloError("not allowed");
    }
    await this.httpContainerManager.delete(id);
    return true;
  }

  @mutation()
  async updateHttpContainer(
    root: void,
    { id, ...fields }: { id: string } & Partial<Pick<HttpContainer, "name" | "hostname" | "path">>,
    context: Context
  ): Promise<HttpContainer> {
    if (!await context.hasPermission(Permission.ManageHttpContainers)) {
      throw new ApolloError("not allowed");
    }
    const container = await this.httpContainerManager.get(id);
    if (!container) {
      throw new ApolloError("not found");
    }
    await this.httpContainerManager.update(id, fields);
    return { ...container, ...fields };
  }
}
