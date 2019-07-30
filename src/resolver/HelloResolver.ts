import { gql } from "apollo-server-core";
import { Service } from "typedi";
import { Resolver, resolver } from "./Resolver";

@Service({ id: Resolver.token, multiple: true })
export class HelloResolver extends Resolver {
  query = gql`
    type Query {
      hello: String!
    }
  `;
  @resolver("Query.hello")
  async hello() {
    return "Hello, world!";
  }
}
