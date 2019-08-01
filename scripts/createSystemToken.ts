import { Token, TokenType } from "../src/lib/Token";

async function main() {
  console.log(new Token({
    type: TokenType.System
  }).sign());
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
