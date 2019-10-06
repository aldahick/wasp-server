import { gql } from "apollo-server-core";
import { GraphQLError } from "graphql";
import { Service } from "typedi";
import { Permission } from "../collections/shared/Permission";
import { User, UserProfile } from "../collections/Users";
import { Context } from "../lib/Context";
import { UserManager } from "../manager/UserManager";
import { DatabaseService } from "../service/DatabaseService";
import { mutation, query, Resolver, resolver } from "./Resolver";

interface UpdateUserProfileParams {
  id?: string;
  profile: {
    firstName?: string,
    lastName?: string
  };
}

@Service({ id: Resolver.token, multiple: true })
export class UserResolver extends Resolver {
  mutations = gql`
    type Mutation {
      addRoleToUser(userId: String, roleId: String!): Boolean!
      createUser(email: String!, password: String!): User!
      updateUserProfile(id: String, profile: UserProfileInput!): User!
    }
  `;
  queries = gql`
    type Query {
      user(id: String): User
    }
  `;
  types = gql`
    input UserProfileInput {
      firstName: String
      lastName: String
    }
    type UserProfile {
      firstName: String
      fullName: String
      lastName: String
    }
    type User {
      _id: String!
      permissions: [Permission!]!
      profile: UserProfile!
      roles: [Role]!
    }
  `;

  constructor(
    private db: DatabaseService,
    private userManager: UserManager
  ) { super(); }

  @mutation()
  async addRoleToUser(root: void, { userId, roleId }: { userId?: string, roleId: string }, context: Context): Promise<boolean> {
    if (context.isUser && !await context.hasPermission(Permission.ManageUsers)) {
      userId = context.userId;
    }
    if (!userId) {
      throw new GraphQLError("must provide id without user token");
    }
    const user = await this.db.users.findById(userId).exec();
    if (!user) {
      throw new GraphQLError("user not found");
    }
    const role = await this.db.roles.findById(roleId).exec();
    if (!role) {
      throw new GraphQLError("role not found");
    }
    await this.userManager.addRole(user, role);
    return true;
  }

  @mutation()
  createUser(root: void, { email, password }: { email: string, password: string }) {
    return this.userManager.create(email, password);
  }

  @mutation()
  async updateUserProfile(root: void, { id, profile: { firstName, lastName } }: UpdateUserProfileParams, context: Context): Promise<User> {
    if (context.isUser && !(await context.hasPermission(Permission.ManageUsers) && id)) {
      id = context.userId;
    }
    if (!id) {
      throw new GraphQLError("must provide id");
    }
    await this.db.users.updateOne({
      _id: id
    }, {
      $set: {
        "profile.firstName": firstName,
        "profile.lastName": lastName
      }
    }).exec();
    return await this.db.users.findById(id).exec() as User;
  }

  @query()
  async user(root: void, { id }: { id?: string }, context: Context) {
    if (!id) {
      if (context.isUser) {
        id = context.userId;
      } else {
        throw new GraphQLError("must provide id without user token");
      }
    }
    return this.db.users.findById(id).exec();
  }

  @resolver("UserProfile.fullName")
  fullName({ firstName, lastName }: UserProfile): string | undefined {
    if (!firstName && !lastName) {
      return undefined;
    }
    return `${firstName || ""} ${lastName || ""}`.trim();
  }
}
