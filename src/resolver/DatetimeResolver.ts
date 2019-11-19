import { gql } from "apollo-server-core";
import * as GraphqlDatetime from "graphql-type-datetime";
import { Resolver, resolver } from "./Resolver";

@Resolver.Service()
export class DatetimeResolver extends Resolver {
  types = gql`
    scalar Date
    scalar Datetime
  `;

  @resolver("Date")
  @resolver("Datetime")
  readonly Datetime = GraphqlDatetime;
}
