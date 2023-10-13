<script lang="ts">
    const reload_all = () => {
        // fetch
    }

    //TODO: toast
</script>

<h1>Settings</h1>

<div>
    <h2>Datasource</h2>
    <button on:click={reload_all} class="btn-generic">Reload all</button>
    <p>Updates all existing entries and tries to fetch new data for books without a connected datasource</p>
</div>