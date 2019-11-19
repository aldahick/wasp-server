declare module "video-thumbnail-generator" {
  export default class ThumbnailGenerator {
    constructor(options: {
      sourcePath: string;
      thumbnailPath: string;
      tmpDir?: string;
    })
    generate(): Promise<string[]>;
    generateOneByPercent(percent: number): Promise<string>;
    generateGif(): Promise<string[]>;
  }
}
