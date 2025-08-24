<script lang="ts">
  //@ts-ignore
  import toast from "svelte-french-toast";
  //@ts-ignore
  import IoMdCopy from "svelte-icons/io/IoMdCopy.svelte";
  //@ts-ignore
  import IoMdTrash from "svelte-icons/io/IoMdTrash.svelte";

  import type { PageData } from "./$types";

  import { enhance } from "$app/forms";
  import EyePlus from "$lib/icons/eye-plus.svelte";
  export let data: PageData;

  let formValues: PageData = deepClone(data);
  let initialValues: PageData = deepClone(data);

  $: formValues = deepClone(data);

  $: registrationCodes = formValues.serverSettings.registrationCodes;
  $: registrationPossible = formValues.serverSettings.registrationPossible;

  function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  async function copyToClipboard(code: string) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText("/register/" + code);
        toast.success("Copied registration link to clipboard");
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    } else {
      console.warn("Clipboard API not supported.");
    }
  }
</script>

<form
  method="POST"
  use:enhance={() => {
    return async ({ update, result }) => {
      // @ts-ignore
      if (result.data.success) {
        toast.success("Successfully updated data");
      }

      update({ reset: false });
    };
  }}
  action="?/save">
  <div class="flex flex-col gap-6">
    <h1 class="text-3xl">Registration</h1>
    <div
      class="gap-2 flex justify-between border generic-border p-4 items-center">
      <div>
        <label for="registrationOpen">Registration open</label>
        <p class="text-secondary text-base">
          Registration possible without codes.
        </p>
      </div>

      <input
        type="checkbox"
        name="registrationOpen"
        id="registrationOpen"
        checked={registrationPossible}
        on:change={() => {
          registrationPossible = !registrationPossible;
        }}
        class="rounded" />
    </div>

    <div>
      <div class="flex justify-between">
        <h2 class="text-2xl">
          Registration codes ({registrationCodes.length})
        </h2>
        <button
          class="btn-generic px-5 sm:px-2 text-base"
          formaction="?/addRegistrationCode"
          type="submit">
          Add
        </button>
      </div>

      {#if registrationCodes.length > 0}
        <div class="flex flex-col gap-3 sm:gap-2 mt-3">
          {#each registrationCodes as code}
            <form action="?/deleteRegistrationCode" method="POST" use:enhance>
              <input type="hidden" name="code" value={code.code} />
              <div class="flex gap-2 items-center justify-between">
                <a
                  href={`/register/${code.code}`}
                  class="underline-hover"
                  target="_blank">
                  {code.code}
                </a>

                <p
                  class="ml-5 text-secondary text-base flex items-center gap-1"
                  title="times used">
                  {code.timesUsed}
                  <span class="block w-4"><EyePlus /></span>
                </p>

                <div class="flex justify-end ms-2 sm:ms-0 sm:flex-1">
                  <span
                    class="inline-flex flex-row divide-x overflow-hidden rounded-md bg-white
                    dark:bg-slate-700">
                    <button
                      class="group inline-block p-2 hover:bg-gray-50 focus:relative
                      dark:hover:bg-slate-500"
                      title="copy"
                      type="button"
                      on:click={async () => await copyToClipboard(code.code)}>
                      <span
                        class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
                        <IoMdCopy alt="copy icon" />
                      </span>
                    </button>

                    <button
                      class="group p-2 btn-delete !border-0"
                      title="Delete code"
                      type="submit">
                      <span
                        class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
                        <IoMdTrash alt="red trash can" />
                      </span>
                    </button>
                  </span>
                </div>
              </div>
            </form>
          {/each}
        </div>
      {:else}
        <p class="text-secondary text-base">No codes added</p>
      {/if}
    </div>

    <div class="flex gap-2 justify-end">
      <button
        type="button"
        class="btn-generic flex-1 sm:flex-initial"
        on:click={async () => {
          formValues = deepClone(initialValues);
        }}>
        Cancel
      </button>
      <button
        type="submit"
        class="btn-primary-black w-36 flex justify-center flex-1 sm:flex-initial">
        Save
      </button>
    </div>

    <section>
      <h2 class="text-3xl">Users</h2>
      <div class="flex flex-col gap-1">
        {#each data.users as user}
          <div class="default-border flex gap-1 items-center p-3">
            <a class="text-lg hover:underline flex-1" href="/{user.username}">
              {user.username}
            </a>

            <div class="flex gap-1 sm:gap-2 flex-1">
              {#each user.lists as list}
                <a
                  href="/{user.username}/lists/{list?.name}"
                  class="hover:underline">
                  {list?.name}
                </a>
                |
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
</form>
