import * as randomstring from "randomstring";

export const randomId = (length = 16) =>
  randomstring.generate({ length });
