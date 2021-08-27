module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",

  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.json",
  },
};
