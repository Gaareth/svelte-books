<script lang="ts">
    interface Props {
        msg: string;
        value: number;
        max: number;
    }

    const { msg, value, max }: Props = $props();
</script>

<div class="flex flex-col">
    <div class="flex gap-1">
        <span>{msg}</span>
        <span class="ml-auto">
            {value}/{max}
        </span>
    </div>
    <progress {max} {value}></progress>
</div>
