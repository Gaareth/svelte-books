<script lang="ts">
  import toast from "svelte-french-toast";

  import type { PageData } from "./$types";

  import { enhance } from "$app/forms";
  import UsersList from "$components/composed/UsersList.svelte";
  import RegistrationSettings from "$components/composed/Admin/RegistrationSettings.svelte";

  export let data: PageData;
</script>

<h1 class="text-5xl my-4">Admin Settings</h1>

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
  <section class="flex flex-col gap-6">
    <h2 class="text-3xl -mb-3">Registration</h2>
    <RegistrationSettings serverSettings={data.serverSettings} />
  </section>

  <section class="flex flex-col gap-6">
    <h2 class="text-3xl -mb-3">Users</h2>
    <div class="flex flex-col gap-1">
      <UsersList users={data.users} />
    </div>
  </section>
</form>
