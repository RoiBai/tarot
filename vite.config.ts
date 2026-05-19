import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS ? "/tarot/" : "/"),
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173
  }
});
