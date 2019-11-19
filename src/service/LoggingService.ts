import * as moment from "moment";
import { Service } from "typedi";

enum LogLevel {
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error"
}

@Service()
export class LoggingService {
  private lastLogTime = moment(0);

  debug(name: string, data?: any) { return this.log(LogLevel.Debug, name, data); }
  info(name: string, data?: any) { return this.log(LogLevel.Info, name, data); }
  warn(name: string, data?: any) { return this.log(LogLevel.Warn, name, data); }
  error(name: string, err: Error, data?: any) { return this.log(LogLevel.Error, name, { err, ...data }); }

  private log(level: LogLevel, name: string, data?: any) {
    const now = moment();
    let dateFormat = "HH:mm:ss";
    if (now.toDate().toLocaleDateString() !== this.lastLogTime.toDate().toLocaleDateString()) {
      dateFormat = "YYYY-MM-DD " + dateFormat;
      this.lastLogTime = now;
    }
    let extra = data;
    if (typeof(extra) === "object") {
      extra = Object.entries(extra || { }).map(([k, v]) => `${k}="${v}"`).join(" ");
    }
    console.log(`${now.format(dateFormat)} [${level}] [${name}] ${extra}`);
  }
}
