import axios, { AxiosRequestConfig } from "axios";
import * as _ from "lodash";
import * as querystring from "querystring";
import Container, { Service } from "typedi";
import { resolve as resolveUrl } from "url";
import { ConfigService } from "./ConfigService";

type FetchOptions = Partial<AxiosRequestConfig> & {
  ignoreChecks?: boolean;
};

@Service()
export class LitApiService {
  private config = Container.get(ConfigService);

  async fetch(method: "GET" | "POST", path: string, params: { [key: string]: string | number | undefined }, { ignoreChecks, ...options }: FetchOptions = { }) {
    const url = resolveUrl(this.config.litApiUrl, path) + "?" + querystring.stringify({
      apikey: this.config.litApiKey,
      appid: this.config.litApiId,
      ...method === "GET" ? params : { }
    });
    const res = await axios({
      url,
      method,
      withCredentials: false,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...options.headers || { }
      },
      data: method !== "GET" ? querystring.stringify(params) : undefined,
      ..._.omit(options, "headers")
    });
    if (ignoreChecks !== true && !res.data.success) {
      throw new Error(res.data.error || ("Unknown error when fetching " + path));
    }
    return res.data;
  }
}
