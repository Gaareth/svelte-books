<script>
  import { page } from "$app/stores";

  const errorMsgs = {
    401: "Looks like you are not allowed to access this content.",
    400: "You either manipulated the request (bad) or something is wrong with your client or our deployed javascript (also bad).",
    403: "This resource is private.",
    500: "This looks like our fault. We are tremendously (yeah really) sorry. Please message me (look in the footer), for feedback.",
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const errorMsg = errorMsgs[$page.status];
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
          class="underline text-[#F2440D]">
          here
        </a>
      {:else if $page.status in errorMsgs}
        {errorMsg}
        Please go back
        <a href="/" class="underline text-[#3DB3FF]">here</a>
      {:else}
        Mhh. Don't know why this happened, but please go back
        <a href="/" class="underline text-[#3DB3FF]">here</a>
      {/if}
    </p>
  </div>
</div>
