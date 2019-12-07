import { ForbiddenError, gql } from "apollo-server-core";
import { GraphQLError } from "graphql";
import { Role } from "../collections/Roles";
import { Permission } from "../collections/shared/Permission";
import { Context } from "../lib/Context";
import { RoleManager } from "../manager/RoleManager";
import { DatabaseService } from "../service/DatabaseService";
import { mutation, query, Resolver } from "./Resolver";

@Resolver.Service()
export class RoleResolver extends Resolver {
  mutations = gql`
    type Mutation {
      addPermissionsToRole(roleId: String!, permissions: [Permission]!): Boolean!
      createRole(name: String!): Role!
    }
  `;
  queries = gql`
    type Query {
      roles: [Role]!
    }
  `;
  types = gql`
    enum Permission {
      ${Object.values(Permission).join("\n")}
    }
    type Role {
      _id: String!
      name: String!
      permissions: [Permission]!
    }
  `;

  constructor(
    private db: DatabaseService,
    private roleManager: RoleManager
  ) { super(); }

  @query()
  async roles() {
    return this.db.roles.find({ }).exec();
  }

  @mutation()
  async addPermissionsToRole(root: void, { roleId, permissions }: { roleId: string; permissions: Permission[] }, context: Context): Promise<boolean> {
    if (!await context.hasPermission(Permission.ManageRoles)) {
      throw new ForbiddenError("manage roles");
    }
    const role = await this.db.roles.findById(roleId).exec();
    if (!role) {
      throw new GraphQLError("role not found");
    }
    await this.roleManager.addPermissions(role, permissions);
    return true;
  }

  @mutation()
  async createRole(root: void, { name }: { name: string }, context: Context): Promise<Role> {
    if (!await context.hasPermission(Permission.ManageRoles)) {
      throw new ForbiddenError("manage roles");
    }
    return this.roleManager.create(name);
  }
}
