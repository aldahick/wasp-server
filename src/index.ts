import "reflect-metadata";

import Container from "typedi";
import { Application } from "./Application";

async function main(): Promise<void> {
  await Container.get(Application).start();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
