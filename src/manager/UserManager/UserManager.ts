import * as _ from "lodash";
import { Service } from "typedi";
import { Role } from "../../collections/Roles";
import { User } from "../../collections/Users";
import { UserAuthType } from "../../collections/Users/auth/UserAuthType";
import { DatabaseService } from "../../service/DatabaseService";
import { UserAuthManager } from "./UserAuthManager";

@Service()
export class UserManager {
  constructor(
    readonly auth: UserAuthManager,
    private db: DatabaseService
  ) { }

  async create(email: string, password: string) {
    const count = await this.db.users.countDocuments({ email }).exec();
    if (count > 0) {
      throw new Error("user with that email already exists");
    }
    return this.db.users.create(new User({
      auth: {
        type: UserAuthType.Local,
        local: {
          passwordHash: await this.auth.hash(password)
        }
      },
      email,
      permissions: [],
      profile: { },
      roleIds: []
    }));
  }

  async addRole(user: User, role: Role) {
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $addToSet: {
        roleIds: role._id,
        permissions: {
          $each: role.permissions
        }
      }
    }).exec();
  }

  async removeRole(user: User, role: Role) {
    const remainingRoles = await this.db.roles.find({
      _id: {
        $and: [{
          $in: user.roleIds
        }, {
          $ne: role._id
        }]
      }
    }).exec();
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $pull: {
        roleIds: role._id
      }
    }).exec();
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $set: {
        permissions: _.flatten(remainingRoles.map(r => r.permissions))
      }
    }).exec();
  }
}
