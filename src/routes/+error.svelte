<script>
  import { page } from "$app/stores";

  const errorMsgs = {
    "401": "Looks like you are not allowed to access this content.",
    "400":
      "You either manipulated the request (bad) or somethings wrong with your client or our deployed js (also bad).",
    "500":
      "This looks like our fault. We are tremendously (yeah really) sorry. Please message me (look in the footer), for feedback.",
  };
</script>

<div class="text-center flex h-screen">
  <div class="m-auto">
    <h1 class="text-5xl">
      {$page.status}
      {$page.error?.message}
    </h1>
    <p>
      {#if $page.status == 404}
        Can't find this resource :(. For all books look <a
          href="/"
          class="underline text-[#F2440D]">here</a
        >
      {:else if errorMsgs.hasOwnProperty($page.status)}
        {errorMsgs[$page.status]}
        Please go back
        <a href="/" class="underline text-[#3DB3FF]">here</a>
      {:else}
        Mhh. Don't know why this happend, but please go back
        <a href="/" class="underline text-[#3DB3FF]">here</a>
      {/if}
    </p>
  </div>
</div>
