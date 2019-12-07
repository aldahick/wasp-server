import * as crypto from "crypto";
import * as os from "os";
import * as path from "path";
import { Readable } from "stream";
import { resolve as resolveUrl } from "url";
import axios from "axios";
import * as fs from "fs-extra";
import { GraphQLError } from "graphql";
import { Service } from "typedi";
import * as unzipper from "unzipper";
import ThumbnailGenerator from "video-thumbnail-generator";
import { ConfigService } from "../../service/ConfigService";
import { ObjectStorageService } from "../../service/ObjectStorageService";
import { MediaItem } from "./MediaItem";
import { MediaItemType } from "./MediaItemType";

@Service()
export class MediaManager {
  constructor(
    private config: ConfigService,
    private objectStorageService: ObjectStorageService
  ) { }

  async list(userId: string, dir = ""): Promise<MediaItem[]> {
    const fullPath = path.join(userId, dir);
    const files = await this.objectStorageService.list(fullPath);
    return Promise.all(files.sort().map(async filename => ({
      key: filename,
      type: await this.getType(path.join(fullPath, filename))
    })));
  }

  async exists(userId: string, key: string): Promise<boolean> {
    return this.objectStorageService.exists(path.join(userId, key));
  }

  async getSize(userId: string, key: string): Promise<number> {
    return this.objectStorageService.getSize(path.join(userId, key));
  }

  async createReadStream(userId: string, key: string, { start, end }: { start: number; end?: number }) {
    return this.objectStorageService.createReadStream(path.join(userId, key), { start, end });
  }

  async scrape(url: string, userId: string, destination: string) {
    if (!this.config.mediaServiceUrl) {
      throw new GraphQLError("missing media service url config");
    }
    const { data: stream } = await axios.get<Readable>(
      resolveUrl(this.config.mediaServiceUrl, "/v1/scrape"), {
        params: { url },
        responseType: "stream"
      });
    const handleEntry = async(entry: unzipper.Entry): Promise<string> => {
      const key = path.join(destination, entry.path);
      const writeStream = await this.objectStorageService.createWriteStream(path.join(userId, key));
      return new Promise(resolve =>
        entry.pipe(writeStream).on("finish", () => resolve(key.replace(/\\/g, "/")))
      );
    };
    const promises: Promise<string>[] = [];
    await stream.pipe(unzipper.Parse()).on("entry", (entry: unzipper.Entry) => {
      promises.push(handleEntry(entry));
    }).promise();
    return Promise.all(promises);
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

  private async getType(fullKey: string): Promise<MediaItemType> {
    if (await this.objectStorageService.isFile(fullKey)) {
      return MediaItemType.File;
    }
    return (await this.objectStorageService.exists(path.join(fullKey, ".series")))
      ? MediaItemType.Series
      : MediaItemType.Directory;
  }
}
