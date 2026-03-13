// import adapter from '@sveltejs/adapter-auto';
import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    alias: {
      $src: "src",
      $utils: "src/lib/utils",
      $components: "src/lib/components",
      $appTypes: "src/app.d.ts",
      $prismaClient: "src/generated/prisma/client",
      $prismaBrowser: "src/generated/prisma/browser",
    },
  },
};

export default config;
