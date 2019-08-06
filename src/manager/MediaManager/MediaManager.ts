import * as path from "path";
import { Service } from "typedi";
import { ObjectStorageService } from "../../service/ObjectStorageService";

@Service()
export class MediaManager {
  constructor(
    private objectStorageService: ObjectStorageService
  ) { }

  async list(userId: string, dir = ""): Promise<string[]> {
    const fullDir = path.join(userId, dir);
    console.log(userId, dir);
    return (await this.objectStorageService.list(fullDir)).sort();
  }

  async exists(userId: string, key: string): Promise<boolean> {
    return this.objectStorageService.exists(path.join(userId, key));
  }

  async getSize(userId: string, key: string): Promise<number> {
    return this.objectStorageService.getSize(path.join(userId, key));
  }

  async createReadStream(userId: string, key: string, { start, end }: { start: number, end?: number }) {
    return this.objectStorageService.createReadStream(path.join(userId, key), { start, end });
  }
}
