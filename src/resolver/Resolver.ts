import { concatAST, DocumentNode } from "graphql";
import { print as printNode } from "graphql/language/printer";
import * as _ from "lodash";
import Container, { Service, Token } from "typedi";

export const query = (name?: string) => defineResolver(key => `Query.${name || key}`);
export const mutation = (name?: string) => defineResolver(key => `Mutation.${name || key}`);

export function resolver(name: string) {
  return defineResolver(() => name);
}

function defineResolver(buildName: (key: string) => string) {
  return (target: any, key: string) => {
    Reflect.defineMetadata("resolver", { name: buildName(key) }, target, key);
  };
}

export class Resolver {
  static token = new Token<Resolver>("resolver");
  static Service = () => Service({ id: Resolver.token, multiple: true });

  mutations?: DocumentNode;
  queries?: DocumentNode;
  types?: DocumentNode;

  static getAll() {
    const targets = Container.getMany(Resolver.token);
    // tslint:disable-next-line ban-types
    const resolvers: { [type: string]: { [field: string]: Function } } = { };

    targets.forEach((target: any) => Object.getOwnPropertyNames(target.constructor.prototype).map(key => {
      if (!Reflect.hasMetadata("resolver", target, key)) { return; }
      if (typeof(target[key]) !== "function") {
        throw new Error("Can't use " + target.constructor.name + "." + key + " as a resolver");
      }
      const { name } = Reflect.getMetadata("resolver", target, key);
      const [type, field] = name.split(".");
      if (!resolvers[type]) { resolvers[type] = { }; }
      (resolvers[type] as any)[field] = target[key].bind(target);
    }));

    const buildSchema = (nodes: (DocumentNode | undefined)[], typeName?: string): string => {
      let schema = printNode(concatAST(_.compact(nodes)));
      if (typeName) {
        schema = `type ${typeName} {\n${schema.replace(new RegExp(`type ${typeName} \\{([^\\}]+)\\}`, "g"), "$1")}}`;
      }
      return schema;
    };

    return {
      resolvers,
      schema: [
        buildSchema(targets.map(t => t.types)),
        buildSchema(targets.map(t => t.mutations), "Mutation"),
        buildSchema(targets.map(t => t.queries), "Query")
      ].join("\n")
    };
  }
}
