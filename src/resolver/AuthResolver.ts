import { gql } from "apollo-server-core";
import { GraphQLError } from "graphql";
import { User } from "../collections/Users";
import { UserAuthType } from "../collections/Users/auth/UserAuthType";
import { Context } from "../lib/Context";
import { AuthToken, AuthTokenType } from "../lib/Token";
import { UserManager } from "../manager/UserManager";
import { DatabaseService } from "../service/DatabaseService";
import { mutation, Resolver, resolver } from "./Resolver";

@Resolver.Service()
export class AuthResolver extends Resolver {
  mutations = gql`
    type Mutation {
      createSystemToken: AuthToken!
      createUserToken(id: String, email: String, password: String): AuthToken!
    }
  `;
  types = gql`
    type AuthToken {
      token: String!
      type: AuthTokenType
      user: User!
    }
    enum AuthTokenType {
      ${Object.values(AuthTokenType).join("\n")}
    }
  `;

  constructor(
    private db: DatabaseService,
    private userManager: UserManager
  ) { super(); }

  @mutation()
  async createSystemToken(root: void, args: void, context: Context): Promise<AuthToken> {
    if (!context.isSystem) {
      throw new GraphQLError("system token required");
    }
    return new AuthToken({
      type: AuthTokenType.System
    });
  }

  @mutation()
  async createUserToken(root: void, { id, email, password }: { id?: string, email?: string, password?: string }, context: Context): Promise<AuthToken> {
    if (context.isUser) {
      id = context.userId;
    } else if (context.isSystem) {
      if (!id) {
        throw new GraphQLError("user ID required");
      }
    } else { // not authed
      if (!email || !password) {
        throw new GraphQLError("username and password are required");
      }
      const user = await this.db.users.findOne({ email }).exec();
      if (!user || user.auth.type !== UserAuthType.Local) {
        throw new GraphQLError("invalid email or password");
      }
      if (await this.userManager.auth.isValid(password, user.auth.local!.passwordHash)) {
        id = user._id;
      } else {
        throw new GraphQLError("invalid email or password");
      }
    }
    return new AuthToken({
      type: AuthTokenType.User,
      userId: id
    });
  }

  @resolver("AuthToken.token")
  token(root: AuthToken): string {
    return root.sign();
  }

  @resolver("AuthToken.type")
  type(root: AuthToken): AuthTokenType {
    return root.payload.type;
  }

  @resolver("AuthToken.user")
  async user(root: AuthToken): Promise<User> {
    if (!root.payload.userId) {
      throw new GraphQLError("not a user token");
    }
    return this.db.users.findById(root.payload.userId).exec() as Promise<User>;
  }
}
