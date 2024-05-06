import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern:'cypress/e2e/**/*.{cy,spec}.{js,jsx}',
    // baseUrl: "http://ip23nw1.sit.kmutt.ac.th:3000",
    baseUrl: "http://localhost:5173",
  },
});
