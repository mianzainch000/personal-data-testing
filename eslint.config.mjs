import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginUnusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Next.js core rules
  ...compat.extends("next/core-web-vitals"),

  // Ignore node_modules and .next completely
  {
    ignores: ["node_modules/**", ".next/**"],
  },

  // Custom rules for your code
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
    },

    plugins: {
      "unused-imports": eslintPluginUnusedImports,
    },

    rules: {
      "no-unused-vars": "off",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", args: "after-used" },
      ],
      "unused-imports/no-unused-imports": "warn",
      "@next/next/no-assign-module-variable": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
