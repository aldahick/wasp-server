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

  async createReadStream(key: string, { start, end }: { start: number, end?: number }) {
    return fs.createReadStream(path.resolve(this.storageDir, key), { start, end });
  }

  async exists(key: string) {
    return fs.pathExists(path.resolve(this.storageDir, key));
  }

  async getSize(key: string): Promise<number> {
    const stats = await fs.stat(path.resolve(this.storageDir, key));
    return stats.size;
  }

  async isFile(key: string): Promise<boolean> {
    const stats = await fs.stat(path.resolve(this.storageDir, key));
    return stats.isFile();
  }

  async list(dir: string) {
    if (!await this.exists(dir)) { return []; }
    const fullDir = path.resolve(this.storageDir, dir);
    const files = await fs.readdir(fullDir);
    return files.map(f => f.replace(/\\/g, "/"));
  }

  private get storageDir() {
    if (!this.config.storageDir) {
      throw new Error("Missing STORAGE_DIR environment variable");
    }
    return this.config.storageDir;
  }
}
