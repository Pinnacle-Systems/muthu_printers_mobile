import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactNative from "eslint-plugin-react-native";
import base from "./base.js";

export default [
  ...base,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: {
        __DEV__: "readonly"
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-native": reactNative
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      "react/jsx-uses-react": "warn",
      "react/jsx-uses-vars": "warn",
      "react/jsx-key": "error",
      "react/jsx-no-undef": "error",
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-native/no-inline-styles": "warn",
      "react-native/no-raw-text": "warn",
      "react-native/no-unused-styles": "warn"
    }
  }
];
