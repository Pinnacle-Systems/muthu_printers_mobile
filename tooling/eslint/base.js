import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "build/**", "coverage/**", "node_modules/**", ".turbo/**", "eslint.config.js"]
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.es2024,
        ...globals.node
      },
      sourceType: "module"
    },
    rules: {
      "eqeqeq": ["error", "always"],
      "no-console": "off",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ]
    }
  }
];
