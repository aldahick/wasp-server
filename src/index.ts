import "reflect-metadata";
import "source-map-support/register";

import Container from "typedi";
import { Application } from "./Application";

const main = async(): Promise<void> => {
  await Container.get(Application).start();
};

process.on("uncaughtException", err => {
  console.error("uncaught exception", err);
});

main().catch(err => {
  console.error(err);
  process.exit(1);
});
