import * as jwt from "jsonwebtoken";
import Container from "typedi";
import { ConfigService } from "../service/ConfigService";

export interface AuthTokenPayload {
  type: AuthTokenType;
  userId?: string;
}

export enum AuthTokenType {
  System = "system",
  User = "user"
}

export class AuthToken {
  constructor(public payload: AuthTokenPayload) { }

  sign() {
    const config = Container.get(ConfigService);
    return jwt.sign(this.payload, config.jwtKey);
  }

  static parse(token: string) {
    const config = Container.get(ConfigService);
    if (!token) {
      return undefined;
    }
    return new AuthToken(jwt.verify(token, config.jwtKey) as any);
  }
}
