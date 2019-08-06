import * as express from "express";
import * as _ from "lodash";
import Container, { Token } from "typedi";
import { LoggingService } from "../service/LoggingService";

export function controller(method: "GET" | "POST", url: string) {
  return (target: any, key: string) => {
    Reflect.defineMetadata("controller", { method, url }, target, key);
  };
}

export class Controller {
  static token = new Token<Controller>("controller");

  static setup(app: express.Application) {
    const targets = Container.getMany(Controller.token);
    targets.forEach((target: any) => Object.getOwnPropertyNames(target.constructor.prototype).map(key => {
      if (!Reflect.hasMetadata("controller", target, key)) { return; }
      if (typeof(target[key]) !== "function") {
        throw new Error("Can't use " + target.constructor.name + "." + key + " as a controller");
      }
      const { method, url } = Reflect.getMetadata("controller", target, key);
      app[method === "GET" ? "get" : "post"](url, (req, res) => {
        (target[key](req, res) as Promise<void>).catch(err => {
          const logger = Container.get(LoggingService);
          logger.error("controller", err, { route: req.path });
          res.sendStatus(500);
        });
      });
    }));
  }
}
