<script lang="ts">
    import UsersList from "$components/composed/UsersList.svelte";

    let { data } = $props();
</script>

<svelte:head>
    <title>Users</title>
</svelte:head>

<h1 class="text-5xl mt-4">Users ({data.users.length})</h1>

<p class="text-secondary">Users are shown here only if they enabled it</p>

<div class="mt-2 flex flex-col gap-1">
    <UsersList users={data.users} />
</div>
