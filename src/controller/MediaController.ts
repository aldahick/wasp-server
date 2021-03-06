import * as express from "express";
import * as mime from "mime";
import { Service } from "typedi";
import { Context } from "../lib/Context";
import { MediaManager } from "../manager/MediaManager";
import { Controller, controller } from "./Controller";

@Service({ id: Controller.token, multiple: true })
export class MediaContentController {
  constructor(
    private mediaManager: MediaManager
  ) { }

  @controller("GET", "/media/content")
  async getMediaContent(req: express.Request, res: express.Response) {
    const context = await this.checkContext(req, res);
    const { key } = req.query;
    if (!(context instanceof Context)) {
      return;
    }
    const mimeType = mime.getType(key) || "text/plain";
    res.setHeader("Content-Type", mimeType);
    let start = 0;
    let end: number | undefined;
    if (mimeType.startsWith("video/")) {
      const size = await this.mediaManager.getSize(context.userId!, key);
      if (req.headers.range) {
        [start, end] = req.headers.range.replace(/bytes=/, "").split("-").map(Number);
      }
      if (!end) {
        end = size - 1;
      }
      res.writeHead(206, {
        "Accept-Range": "bytes",
        "Content-Length": (end - start) + 1,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Type": mimeType
      });
    }
    const stream = await this.mediaManager.createReadStream(context.userId!, key, { start, end });
    stream.pipe(res);
  }

  @controller("GET", "/media/thumbnail")
  async getMediaThumbnail(req: express.Request, res: express.Response) {
    const context = await this.checkContext(req, res);
    const { key } = req.query;
    if (!(context instanceof Context)) {
      return;
    }
    res.setHeader("Content-Type", "image/png");
    const buffer = await this.mediaManager.createThumbnail(context.userId!, key);
    res.send(buffer);
  }

  private async checkContext(req: express.Request, res: express.Response): Promise<Context | express.Response> {
    const context = new Context(req);
    const userId = context.userId;
    if (!context.isUser || !userId) { return res.sendStatus(403); }
    const { key } = req.query;
    if (!key) { return res.sendStatus(404); }
    if (!await this.mediaManager.exists(userId, key)) { return res.sendStatus(404); }
    return context;
  }
}
