import * as express from "express";
import Container from "typedi";
import { Permission } from "../collections/shared/Permission";
import { User } from "../collections/Users";
import { DatabaseService } from "../service/DatabaseService";
import { Token, TokenType } from "./Token";

export class Context {
  private db = Container.get(DatabaseService);

  private token?: Token;
  private _user?: User;

  constructor(req: express.Request) {
    if (req.headers.authorization) {
      const [prefix, token] = req.headers.authorization.split(" ");
      if (prefix.toLowerCase() === "bearer") {
        this.token = Token.parse(token);
      }
    } else if (req.query.token) {
      this.token = Token.parse(req.query.token);
    }
  }

  get hasToken() {
    return !!this.token;
  }

  get isUser() {
    return this.token && this.token.payload.type === TokenType.User;
  }
  get isSystem() {
    return this.token && this.token.payload.type === TokenType.System;
  }

  get userId(): string | undefined {
    if (!this.token || !this.isUser) { return undefined; }
    return this.token.payload.userId;
  }
  async user(): Promise<User | undefined> {
    if (this._user) { return this._user; }
    const userId = this.userId;
    if (!userId) { return; }
    const user = await this.db.users.findById(userId).exec();
    this._user = user || undefined;
    return this._user;
  }

  async hasPermission(permission: Permission): Promise<boolean> {
    if (this.isSystem) {
      return true;
    }
    const user = await this.user();
    if (!user) {
      return false;
    }
    return user.permissions.includes(permission);
  }

}
