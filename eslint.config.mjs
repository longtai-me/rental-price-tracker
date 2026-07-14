import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig, globalIgnores } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals"),
  globalIgnores([
    ".next/**",
    ".vercel/**",
    ".wrangler/**",
    "out/**",
    "build/**",
    "scripts/**",
    "fix-async-hooks.mjs",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
