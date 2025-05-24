import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [  ...compat.extends("next/core-web-vitals", "next/typescript"),  {    ignores: [      // Generated files      "src/generated/**/*",      ".next/**/*",      // Build outputs      "dist/**/*",      "build/**/*",      // Dependencies      "node_modules/**/*",    ],    rules: {      "@typescript-eslint/no-unused-vars": "off",      "@typescript-eslint/no-explicit-any": "warn", // Allow any but warn      "@typescript-eslint/no-empty-object-type": "warn", // Allow {} but warn      "@typescript-eslint/no-wrapper-object-types": "warn", // Allow Object but warn      "@typescript-eslint/no-unsafe-function-type": "warn", // Allow Function but warn      "@typescript-eslint/no-unnecessary-type-constraint": "warn", // Allow unnecessary constraints but warn      "@typescript-eslint/no-this-alias": "warn", // Allow this aliases but warn      "@typescript-eslint/no-require-imports": "off", // Allow require imports (needed for some configs)    },  },];

export default eslintConfig;
