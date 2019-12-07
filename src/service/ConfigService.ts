import * as dotenv from "dotenv";
dotenv.config();

import { Service } from "typedi";

const setValue = <T>(key: string, transformer?: (value: string) => T) =>
  (target: ConfigService, fieldName: keyof ConfigService) => {
    const value = process.env[key];
    if (!value) {
      return false;
    }
    (target as any)[fieldName] = transformer ? transformer(value) : value;
    return true;
  };

const optional = <T = string>(key: string, transformer?: (value: string) => T) =>
  (target: ConfigService, fieldName: keyof ConfigService) => {
    setValue(key, transformer)(target, fieldName);
  };

const required = <T = string>(key: string, transformer?: (value: string) => T) =>
  (target: ConfigService, fieldName: keyof ConfigService) => {
    const isFound = setValue(key, transformer)(target, fieldName);
    if (!isFound) {
      console.error("Missing environment variable " + key);
      process.exit(1);
    }
  };

@Service()
export class ConfigService {
  @required("HTTP_PORT", Number) httpPort!: number;
  @required("JWT_KEY") jwtKey!: string;
  @required("MONGO_URL") mongoUrl!: string;

  // Service URLs
  @optional("MEDIA_SERVICE_URL") mediaServiceUrl?: string;
  @optional("STORY_SERVICE_URL") storyServiceUrl?: string;
  @optional("WEST_WING_SERVICE_URL") westWingServiceUrl?: string;

  @optional("STORAGE_DIR") storageDir?: string;
}
