import { sveltekit } from "@sveltejs/kit/vite";
import { imagetools } from "@zerodevx/svelte-img/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit(), imagetools()],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});
