<svelte:head>
  <title>Books Tech-Stack</title>
</svelte:head>

<div class="border rounded-md p-3 mt-8 px-7">
  <h1
    class="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-b
  from-svelte to-blue-300"
  >
    Tech-Stack
  </h1>
  <p class="my-2">What I have used for this project:</p>
  <ul class="my-2 list-disc">
    <li>Svelte/kit</li>
    <li>Typescript</li>
    <li>Prisma</li>
    <li>NextAuth</li>
  </ul>

  <ul class="my-2 list-disc">
    <li>svelte-french-toast</li>
    <li>svelte-icons</li>
    <li>zod</li>
    <li>bcrypt</li>
  </ul>
</div>

<style>
  .from-svelte {
     --tw-gradient-from: #F2440D;
    /* --tw-gradient-to: rgb(249 115 22 / 0); */
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
  }
</style>
