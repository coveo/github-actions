module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: "eslint:recommended",
  overrides: [
    {
      files: "**/*.ts",
      parser: "@typescript-eslint/parser",

      plugins: ["@typescript-eslint"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
  ],
};
