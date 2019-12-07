import { AuthToken, AuthTokenType } from "../src/lib/Token";

const main = async () => {
  console.log(new AuthToken({
    type: AuthTokenType.System
  }).sign());
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
