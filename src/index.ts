import "reflect-metadata";

import Container from "typedi";
import { Application } from "./Application";

async function main(): Promise<void> {
  await Container.get(Application).start();
}

main().catch(console.error);
