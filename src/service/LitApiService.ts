import axios, { AxiosRequestConfig } from "axios";
import * as _ from "lodash";
import Container, { Service } from "typedi";
import { resolve as resolveUrl } from "url";
import { ConfigService } from "./ConfigService";

type FetchOptions = Partial<AxiosRequestConfig> & {
  ignoreChecks?: boolean;
};

@Service()
export class LitApiService {
  private config = Container.get(ConfigService);

  async fetch(method: "GET" | "POST", path: string, params: { [key: string]: string | number}, { ignoreChecks, ...options }: FetchOptions = { }) {
    let url = resolveUrl(this.config.litApiUrl, path);
    const queryParams = new URLSearchParams({
      apikey: this.config.litApiKey,
      appid: this.config.litApiId
    });
    if (method === "GET") {
      Object.entries(params).forEach(([k, v]) => queryParams.set(k, v.toString()));
    }
    url += "?" + queryParams.toString();
    const res = await axios({
      url,
      method,
      withCredentials: false,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...options.headers || { }
      },
      data: method !== "GET" ? params : undefined,
      ..._.omit(options, "headers")
    });
    if (ignoreChecks !== true && !res.data.success) {
      throw new Error(res.data.error || ("Unknown error when fetching " + path));
    }
    return res.data;
  }
}
