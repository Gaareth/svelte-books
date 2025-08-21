// // TypeScript Project

// module.exports = {
//   root: true,
//   extends: [
//     "eslint:recommended",
//     "plugin:@typescript-eslint/recommended",
//     "plugin:svelte/recommended",
//   ],
//   parser: "@typescript-eslint/parser",
//   plugins: ["@typescript-eslint"],
//   rules: {
//     "typescript-eslint/ban-ts-comment": "off",
//   },
//   parserOptions: {
//     sourceType: "module",
//     ecmaVersion: 2020,
//     extraFileExtensions: [".svelte"],
//   },
//   env: {
//     browser: true,
//     es2017: true,
//     node: true,
//   },
//   overrides: [
//     {
//       files: ["*.svelte"],
//       parser: "svelte-eslint-parser",
//       parserOptions: {
//         parser: "@typescript-eslint/parser",
//       },
//     },
//   ],
// };
// TypeScript + Svelte Project
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:svelte/recommended",
    "prettier", // ⬅ disables ESLint formatting rules that conflict with Prettier
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import", "unused-imports"],
  rules: {
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      { vars: "all", varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],

    "@typescript-eslint/ban-ts-comment": "off",

    // 🚀 Import ordering
    "import/order": [
      "error",
      {
        groups: [
          "builtin", // Node.js builtins
          "external", // npm modules
          "internal", // alias paths (like @/utils)
          ["parent", "sibling", "index"], // relative imports
          "object",
          "type",
        ],
        pathGroups: [
          {
            pattern: "svelte",
            group: "external",
            position: "before",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        "newlines-between": "always",
      },
    ],
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    extraFileExtensions: [".svelte"],
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],
  settings: {
    "svelte3/typescript": () => require("typescript"),
    "import/resolver": {
      node: {
        extensions: [".js", ".ts", ".svelte"],
      },
    },
  },
};
