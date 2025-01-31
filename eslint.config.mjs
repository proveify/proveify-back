// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        extends: [
            eslint.configs.recommended,
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
        ],
        rules: {
            "@typescript-eslint/explicit-member-accessibility": "error",
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/no-extraneous-class": "off",
        },
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        ignores: ["./eslint.config.mjs"],
        files: ["src/**/*.ts"],
    },
    eslintPluginPrettierRecommended,
);
