import { Service } from "typedi";
import { Role } from "../../collections/Roles";
import { Permission } from "../../collections/shared/Permission";
import { DatabaseService } from "../../service/DatabaseService";

@Service()
export class RoleManager {
  constructor(
    private db: DatabaseService
  ) { }

  async create(name: string) {
    const count = await this.db.roles.countDocuments({ name }).exec();
    if (count > 0) {
      throw new Error("role with that name already exists");
    }
    return this.db.roles.create(new Role({
      name,
      permissions: []
    }));
  }

  async addPermissions(role: Role, permissions: Permission[]) {
    await this.db.roles.updateOne({
      _id: role._id
    }, {
      $addToSet: {
        permissions: {
          $each: permissions
        }
      }
    }).exec();
  }
}
