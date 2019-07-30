import { gql } from "apollo-server-core";
import { Service } from "typedi";
import { User } from "../collections/Users";
import { Resolver, resolver } from "./Resolver";

@Service({ id: Resolver.token, multiple: true })
export class UserResolver extends Resolver {
  types = gql`
    type UserProfile {
      firstName: String
      fullName: String
      lastName: String
    }
    type User {
      profile: UserProfile!
    }
  `;

  @resolver("UserProfile.fullName")
  fullName({ profile: { firstName, lastName }}: User): string | undefined {
    if (!firstName && !lastName) {
      return undefined;
    }
    return `${firstName || ""} ${lastName || ""}`.trim();
  }
}
