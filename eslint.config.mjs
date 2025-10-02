import library from "@fjell/eslint-config/library";

export default [
  ...library,
  {
    ignores: ["**/dist", "**/node_modules"],
  },
  {
    // Relax undefined rule for tests
    files: ["tests/**/*.ts", "tests/**/*.tsx"],
    rules: {
      "no-undefined": "off",
    },
  },
];
