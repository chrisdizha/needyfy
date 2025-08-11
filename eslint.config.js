
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // Completely disallow React namespace imports to prevent hook errors
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["react"],
              "importNames": ["default"],
              "message": "Import React hooks by name (useState, useEffect, etc.) instead of React.useState to prevent hook errors. Use 'import { useState, useEffect } from \"react\"' instead of 'import React from \"react\"'."
            }
          ]
        }
      ],
      // Additional rule to catch React.* usage in code
      "no-restricted-syntax": [
        "error",
        {
          "selector": "MemberExpression[object.name='React'][property.name=/^use/]",
          "message": "Use named imports for React hooks instead of React.useState, React.useEffect, etc."
        }
      ]
    },
  }
);
