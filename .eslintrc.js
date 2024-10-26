module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    ...require("typescript-eslint").configs.recommended,
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
  overrides: [
    {
      files: ["**/*.{js,mjs,cjs,ts}"],
      languageOptions: {
        globals: require("globals").browser,
      },
    },
  ],
};
