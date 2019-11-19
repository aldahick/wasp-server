import * as randomstring from "randomstring";

export function randomId(length = 16) {
  return randomstring.generate({ length });
}
