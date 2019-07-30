import * as dotenv from "dotenv";
dotenv.config();

import { Service } from "typedi";

function optional(key: string) {
  return (target: ConfigService, fieldName: keyof ConfigService) => {
    const value = process.env[key];
    (target as any)[fieldName] = value;
    return !!value;
  };
}
function required(key: string) {
  return (target: ConfigService, fieldName: keyof ConfigService) => {
    const isFound = optional(key)(target, fieldName);
    if (!isFound) {
      console.error("Missing environment variable " + key);
      process.exit(1);
    }
  };
}

@Service()
export class ConfigService {
  @required("DATABASE_URL") databaseUrl!: string;
}
