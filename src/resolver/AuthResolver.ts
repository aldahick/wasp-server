import { gql } from "apollo-server-core";
import { GraphQLError } from "graphql";
import { UserAuthType } from "../collections/Users/auth/UserAuthType";
import { Context } from "../lib/Context";
import { AuthToken, AuthTokenType } from "../lib/Token";
import { UserManager } from "../manager/UserManager";
import { DatabaseService } from "../service/DatabaseService";
import { mutation, Resolver } from "./Resolver";

@Resolver.Service()
export class AuthResolver extends Resolver {
  mutations = gql`
    type Mutation {
      createSystemToken: String!
      createUserToken(id: String, email: String, password: String): String!
    }
  `;

  constructor(
    private db: DatabaseService,
    private userManager: UserManager
  ) { super(); }

  @mutation()
  async createSystemToken(root: void, args: void, context: Context): Promise<string> {
    if (!context.isSystem) {
      throw new GraphQLError("system token required");
    }
    return new AuthToken({
      type: AuthTokenType.System
    }).sign();
  }

  @mutation()
  async createUserToken(root: void, { id, email, password }: { id?: string, email?: string, password?: string }, context: Context): Promise<string> {
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
    }).sign();
  }
}
