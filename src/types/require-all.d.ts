declare module "require-all" {
  export interface RequireAllOptions {
    dirname: string;
    filter?: RegExp;
    resolve?: (value: any) => any;
    map?: (name: string, path: string) => string;
  }
  function requireAll(options: string | RequireAllOptions): any[];
  export = requireAll;
}
