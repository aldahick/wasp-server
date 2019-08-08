import * as path from "path";
import { Service } from "typedi";
import { ObjectStorageService } from "../../service/ObjectStorageService";
import { MediaItem } from "./MediaItem";

@Service()
export class MediaManager {
  constructor(
    private objectStorageService: ObjectStorageService
  ) { }

  async list(userId: string, dir = ""): Promise<MediaItem[]> {
    const fullPath = path.join(userId, dir);
    const files = await this.objectStorageService.list(fullPath);
    return Promise.all(files.sort().map(async filename => ({
      key: filename,
      isFile: await this.objectStorageService.isFile(path.join(fullPath, filename))
    })));
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
