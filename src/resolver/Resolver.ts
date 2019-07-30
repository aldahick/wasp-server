import { concatAST, DocumentNode } from "graphql";
import { print as printNode } from "graphql/language/printer";
import * as _ from "lodash";
import Container, { Token } from "typedi";

export function resolver(name: string) {
  return (target: any, key: string) => {
    Reflect.defineMetadata("resolver", { name }, target, key);
  };
}

export class Resolver {
  static token = new Token<Resolver>("resolver");

  mutation?: DocumentNode;
  query?: DocumentNode;
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

    const buildSchema = (nodes: (DocumentNode | undefined)[]) => {
      const node = concatAST(_.compact(nodes));
      return printNode(node);
      // return nodes.filter(n => n && n.loc).map(n => n!.loc!.source.body).join("\n");
    };

    return {
      resolvers,
      schema: ["types", "mutation", "query"].map(k =>
        buildSchema(targets.map(t => (t as any)[k]))
      ).join("\n")
    };
  }
}
