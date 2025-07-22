import library from "@fjell/eslint-config/library";

export default [
  ...library,
  {
    ignores: ["**/dist", "**/node_modules"],
  },
];
