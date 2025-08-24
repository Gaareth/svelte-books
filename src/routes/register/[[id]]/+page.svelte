<script lang="ts">
  import { twMerge } from "tailwind-merge";

  import type { ActionData, PageData } from "./$types";

  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import InputAll from "$lib/InputAll.svelte";
  import InputText from "$lib/InputText.svelte";

  export let data: PageData;
  export let form: ActionData;

  // console.log(form);
</script>

{#if !data.showForm}
  <div class="max-w-xl mx-auto">
    <h1 class="text-4xl mt-16">Sign-up requires a registration code</h1>
    <p class="text-secondary mt-1">
      Sorry for the inconveniences, but registration currently requires a
      registration code. If you have one enter it below
    </p>

    {#if data.invalidCode}
      <p class="text-error !text-lg mt-5">
        Invalid link. {data.invalidCode} is not an valid registration code
      </p>
    {/if}

    <form
      action="?/redirectRegistration"
      method="POST"
      class="mt-5"
      use:enhance={() => {
        // remove invalid code from url
        if (data.invalidCode) {
          goto("/register");
        }

        // don't add reset: false, as this (form clearing) is the only indicator the new code is still wrong
      }}>
      <label class="flex flex-col mt-1" for="code">Registration code</label>
      <div class="flex gap-1">
        <input
          type="text"
          name="code"
          id="code"
          required
          class={twMerge(
            "input",
            form?.success === false ? "input-error" : ""
          )} />
        <button class="btn-submit border-0">Enter</button>
      </div>
      {#if form?.success === false}
        <p class="text-error">Invalid code</p>
      {/if}
    </form>
  </div>
{:else}
  <div class="center-screen p-3 sm:p-6">
    <div>
      <h1 class="text-5xl text-center mb-10">Sign-up</h1>
      <div class="relative flex flex-1 flex-col items-center justify-center">
        <div class="mb-4">
          {#if form?.message}
            <p class="text-error text-center">{form?.message}</p>
          {/if}

          {#if form?.errors?.code}
            <p class="text-error text-center">
              Code: {form?.errors.code[0]}. You should only see this error if
              something went pretty wrong.
            </p>
          {/if}
        </div>

        <form
          method="POST"
          action="?/register"
          use:enhance={() => {
            return async ({ update }) => {
              update({ reset: false });
            };
          }}
          class="w-full max-w-sm">
          <div>
            <InputText
              name="username"
              error={(form?.errors?.username ?? [undefined])[0]} />
          </div>

          <div class="mt-4">
            <InputAll
              name="password"
              autocomplete="new-password"
              type="password"
              error={(form?.errors?.password ?? [undefined])[0]} />
          </div>

          <button class="btn-submit w-full mt-8" type="submit">register</button>
          <input type="hidden" name="code" value={data.validCode} />
          <p class="text-lg text-secondary mt-4">
            Already have an account? <a
              href="/login/"
              class="dark:text-blue-400 text-blue-500 underline text-lg">
              Login here
            </a>
          </p>
        </form>
      </div>
    </div>
  </div>
{/if}
