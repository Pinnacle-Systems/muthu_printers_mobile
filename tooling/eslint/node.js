import globals from "globals";
import base from "./base.js";

export default [
  ...base,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      "callback-return": "warn",
      "handle-callback-err": "error",
      "no-process-exit": "error"
    }
  }
];
