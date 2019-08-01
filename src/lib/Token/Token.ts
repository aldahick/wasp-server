import * as jwt from "jsonwebtoken";
import Container from "typedi";
import { ConfigService } from "../../service/ConfigService";
import { TokenPayload } from "./TokenPayload";

export class Token {
  constructor(public payload: TokenPayload) { }

  sign() {
    const config = Container.get(ConfigService);
    return jwt.sign(this.payload, config.jwtKey);
  }

  static parse(token: string) {
    const config = Container.get(ConfigService);
    if (!token) {
      return undefined;
    }
    return new Token(jwt.verify(token, config.jwtKey) as any);
  }
}
