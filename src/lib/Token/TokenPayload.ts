import { TokenType } from "./TokenType";

export interface TokenPayload {
  type: TokenType;
  userId?: string;
}
