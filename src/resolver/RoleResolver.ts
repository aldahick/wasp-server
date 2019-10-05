import { ForbiddenError, gql } from "apollo-server-core";
import { GraphQLError } from "graphql";
import { Service } from "typedi";
import { Role } from "../collections/Roles";
import { Permission } from "../collections/shared/Permission";
import { Context } from "../lib/Context";
import { RoleManager } from "../manager/RoleManager";
import { DatabaseService } from "../service/DatabaseService";
import { Resolver, resolver } from "./Resolver";

@Service({ id: Resolver.token, multiple: true })
export class RoleResolver extends Resolver {
  mutation = gql`
    type Mutation {
      addPermissionsToRole(roleId: String!, permissions: [Permission]!): Boolean!
      createRole(name: String!): Role!
    }
  `;
  query = gql`
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

  @resolver("Query.roles")
  async roles() {
    return this.db.roles.find({ }).exec();
  }

  @resolver("Mutation.addPermissionsToRole")
  async addPermissionsToRole(root: void, { roleId, permissions }: { roleId: string, permissions: Permission[] }, context: Context): Promise<boolean> {
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

  @resolver("Mutation.createRole")
  async createRole(root: void, { name }: { name: string }, context: Context): Promise<Role> {
    if (!await context.hasPermission(Permission.ManageRoles)) {
      throw new ForbiddenError("manage roles");
    }
    return this.roleManager.create(name);
  }
}
