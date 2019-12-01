import * as fs from "fs-extra";
import * as _ from "lodash";
import * as path from "path";
import { Service } from "typedi";
import { ConfigService } from "./ConfigService";

@Service()
export class ObjectStorageService {
  constructor(
    private config: ConfigService
  ) { }

  getFilename(key: string): string {
    return path.resolve(this.storageDir, key);
  }

  async createReadStream(key: string, { start, end }: { start: number, end?: number }) {
    return fs.createReadStream(this.getFilename(key), { start, end });
  }

  async exists(key: string) {
    return fs.pathExists(this.getFilename(key));
  }

  async getSize(key: string): Promise<number> {
    const stats = await fs.stat(this.getFilename(key));
    return stats.size;
  }

  async isFile(key: string): Promise<boolean> {
    const stats = await fs.stat(this.getFilename(key));
    return stats.isFile();
  }

  async list(dir: string) {
    if (!await this.exists(dir)) { return []; }
    const files = await fs.readdir(this.getFilename(dir));
    return files
      .filter(f => !f.startsWith("."))
      .map(f => f.replace(/\\/g, "/"));
  }

  private get storageDir() {
    if (!this.config.storageDir) {
      throw new Error("Missing STORAGE_DIR environment variable");
    }
    return this.config.storageDir;
  }
}
