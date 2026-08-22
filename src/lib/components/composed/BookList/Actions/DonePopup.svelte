<script lang="ts">
    import toast from "svelte-french-toast";

    import RatingForm from "../../ReadingActivity/RatingForm.svelte";

    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { Prisma } from "$prismaBrowser";
    import { ReadingActivityType } from "$prismaBrowser";
    import Modal from "$src/lib/components/Modal.svelte";
    import { generateBookFinishedCongratulations } from "$src/lib/utils/userFeedbackGenerator";

    type CurrentlyReadingEntry = Prisma.ReadingActivityGetPayload<{
        include: {
            dateStarted: true;
            dateFinished: true;
            status: true;
            book: true;
        };
    }>;

    interface Props {
        id?: string | undefined;
        openModal: boolean;
        entry: CurrentlyReadingEntry;
    }

    let { id, openModal = $bindable(), entry }: Props = $props();

    function rateBook() {
        return async ({ result }: { result: any }) => {
            await invalidateAll();

            //@ts-ignore
            if (result.success) {
                toast.success(generateBookFinishedCongratulations(entry));
                openModal = false;
                // error = undefined;
            } else {
                //@ts-ignore
                console.log("error", result.error);
                //@ts-ignore
                // error = result.error;
                //@ts-ignore
                let msg = result.message ?? "Unknown error";
                toast.error(`Error rating reading activity: ${msg}`);
            }
        };
    }
</script>

<Modal
    {id}
    bind:showModal={openModal}
    divClassName="w-full"
    className="w-full lg:w-2/6">
    {#snippet header()}
        <div class="flex items-center gap-4 w-full" >
            <p class="font-medium">
                Finish and rate book: {entry.book.name}?
            </p>
        </div>
    {/snippet}

    <form
        action="/api/reading-activity/transform"
        method="POST"
        class="flex flex-col h-full justify-center"
        use:enhance={rateBook}>
        <input type="hidden" name="readingActivityId" value={entry.id} />
        <input
            type="hidden"
            name="targetStatus"
            value={ReadingActivityType.FINISHED} />

        <RatingForm {entry} create={true} />

        <div
            class="min-[500px]:flex min-[500px]:justify-end grid grid-cols-2 gap-2 mt-auto">
            <button
                class="bg-blue-500 text-white py-3 px-4 my-4 rounded-md w-full dark:hover:bg-blue-600 hover:bg-blue-600"
                type="submit">
                Rate and Finish Now!
            </button>

            <button
                class="dark:text-white py-3 px-4 my-4 rounded-md w-full dark:bg-slate-600 dark:hover:bg-gray-500 btn-generic dark:border-none"
                type="button"
                commandFor={id}
                command="close"
                onclick={() => (openModal = false)}>
                Cancel
            </button>
        </div>
        <p class="text-secondary text-base text-center -mb-3 -mt-2">
            You can always change the exact date or rating later in the book's page.
        </p>
    </form>
</Modal>
