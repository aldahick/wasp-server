import * as crypto from "crypto";
import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";
import { Service } from "typedi";
import ThumbnailGenerator from "video-thumbnail-generator";
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

  async createThumbnail(userId: string, key: string): Promise<Buffer> {
    const sourcePath = this.objectStorageService.getFilename(path.join(userId, key));
    const hash = crypto.createHash("md5").update(sourcePath).digest("hex");
    const thumbnailPath = path.join(os.tmpdir(), hash);
    const generator = new ThumbnailGenerator({ sourcePath, thumbnailPath });
    const tempOutput = path.join(thumbnailPath, await generator.generateOneByPercent(0));
    const buffer = await fs.readFile(tempOutput);
    await fs.unlink(tempOutput);
    return buffer;
  }
}
