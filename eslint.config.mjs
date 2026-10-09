import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Parâmetro que começa com _ não é usado de propósito (ex.: o estado
      // anterior que toda ação de formulário recebe).
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }],
    },
  },
  { ignores: ["node_modules/**", ".next/**", "next-env.d.ts", "public/**", "drizzle/**"] },
];

export default config;
