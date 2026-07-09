import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // El proyecto usa consistentemente el patrón "fetch on mount"
      // (useEffect(() => { fetchX() }, [fetchX])) en todos los hooks de
      // hooks/*.ts. Es el patrón estándar de React para cargar datos al
      // montar un componente; esta regla del React Compiler lo marca como
      // error incluso cuando se usa de forma correcta y consistente.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;