import * as dotenv from "dotenv";
dotenv.config();

import { Service } from "typedi";

function setValue<T>(key: string, transformer?: (value: string) => T) {
  return (target: ConfigService, fieldName: keyof ConfigService) => {
    const value = process.env[key];
    if (!value) {
      return false;
    }
    (target as any)[fieldName] = transformer ? transformer(value) : value;
    return true;
  };
}
function optional<T = string>(key: string, transformer?: (value: string) => T) {
  return (target: ConfigService, fieldName: keyof ConfigService) => {
    setValue(key, transformer)(target, fieldName);
  };
}
function required<T = string>(key: string, transformer?: (value: string) => T) {
  return (target: ConfigService, fieldName: keyof ConfigService) => {
    const isFound = setValue(key, transformer)(target, fieldName);
    if (!isFound) {
      console.error("Missing environment variable " + key);
      process.exit(1);
    }
  };
}

@Service()
export class ConfigService {
  @required("HTTP_PORT", Number) httpPort!: number;
  @required("JWT_KEY") jwtKey!: string;
  @required("MONGO_URL") mongoUrl!: string;
  @optional("STORAGE_DIR") storageDir?: string;
}
