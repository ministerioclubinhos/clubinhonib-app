import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default tseslint.config(
  // `e2e/report` e `e2e/test-results` são saída do Playwright: o relatório HTML
  // traz o bundle minificado do visualizador de traces, e lintá-lo derrubava o
  // gate com milhares de erros logo depois de qualquer rodada que retivesse um
  // trace. Os dois já são ignorados pelo git.
  { ignores: ["dist", "node_modules", "build", "e2e/report", "e2e/test-results"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react: pluginReact,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      // `ignoreRestSiblings` porque `const { senha, ...resto } = x` é o jeito
      // correto de omitir um campo, e não um descuido. O prefixo `_` marca o
      // que existe de propósito sem ser usado.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  }
);