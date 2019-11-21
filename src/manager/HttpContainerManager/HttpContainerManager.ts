import * as moment from "moment";
import Container, { Service } from "typedi";
import { HttpContainer } from "../../collections/HttpContainers";
import { DatabaseService } from "../../service/DatabaseService";

@Service()
export class HttpContainerManager {
  private db = Container.get(DatabaseService);

  async get(id: string): Promise<HttpContainer | null> {
    return this.db.httpContainers.findOne({ _id: id }).exec();
  }

  async getAll(): Promise<HttpContainer[]> {
    return this.db.httpContainers.find({ }).exec();
  }

  async create(fields: Pick<HttpContainer, "name" | "hostname" | "path">): Promise<HttpContainer> {
    this.checkContainer(fields);
    // TODO queue config-update event in Redis
    return this.db.httpContainers.create(new HttpContainer({
      ...fields,
      certificateExpiresAt: moment().add(30, "days").toDate()
    }));
  }

  async delete(id: string): Promise<void> {
    // TODO queue config-update event in Redis
    await this.db.httpContainers.deleteOne({ _id: id }).exec();
  }

  async update(id: string, { name, hostname, path }: Partial<Pick<HttpContainer, "name" | "hostname" | "path">>): Promise<void> {
    this.checkContainer({ name, hostname, path });
    // TODO queue config-update event in Redis
    await this.db.httpContainers.updateOne({
      _id: id
    }, {
      $set: { name, hostname, path }
    }).exec();
  }

  private checkContainer({ name, hostname, path }: Partial<HttpContainer>) {
    if (path && !/^\/.*\/$/.test(path)) {
      throw new Error("Invalid path");
    }
    if (!name && !hostname && !path) {
      throw new Error("Must specify at least one field to update");
    }
  }
}
