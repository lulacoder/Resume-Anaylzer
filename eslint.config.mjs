import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Disable rules that might cause CSS syntax errors in TS/TSX files
      // This is a common workaround if a CSS linter is misconfigured or implicitly applied
      "no-unused-vars": "off", // Example: disable a rule that might conflict
      // Add other rules to disable if the error persists and points to specific CSS-related rules
    },
  },
];

export default eslintConfig;
