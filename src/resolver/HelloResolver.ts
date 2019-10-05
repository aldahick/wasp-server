import { gql } from "apollo-server-core";
import { query, Resolver } from "./Resolver";

@Resolver.Service()
export class HelloResolver extends Resolver {
  queries = gql`
    type Query {
      hello: String!
    }
  `;

  @query()
  async hello() {
    return "Hello, world!";
  }
}
