<script lang="ts">
    import toast from "svelte-french-toast";

    import type { Prisma } from "$prismaBrowser";

    import { formatShort } from "$components/input/DateSelector.svelte";
    import Popup from "$components/Popup.svelte";

    interface Props {
        id?: string | undefined;
        openModal?: boolean;
        deletionEntry: Prisma.ReadingActivityGetPayload<{
            include: {
                book: true;
                dateFinished: true;
                dateStarted: true;
                status: true;
            };
        }>;
        onSuccess?: () => void;
        onError?: () => void;
    }

    let { id, openModal = $bindable(), deletionEntry, onSuccess, onError }: Props = $props();

    const deleteEntry = () => {
        let res = new Promise((resolve, reject) => {
            fetch("/api/reading-activity/delete", {
                method: "POST",
                body: JSON.stringify({ id: deletionEntry.id }),
            }).then((response) => {
                response.json().then(({ success }) => {
                    if (success) {
                        resolve(true);
                        onSuccess?.();
                    } else {
                        reject(response);
                        onError?.();
                    }
                });
            });
        });

        // TODO: give more info upon error, by moving into block above
        toast.promise(res, {
            loading:
                "Deleting reading activity of book" +
                "'" +
                deletionEntry.book.name +
                "'",
            success:
                "Successfully deleted entry of book " +
                "'" +
                deletionEntry.book.name +
                "'!",
            error: "Error deleting book :(",
        });
    };

    // if (success) {
    //     toast.success("Successfully deleted book");

    //     dispatch("success")
    //   } else {
    //     toast.error("[" + response.status + "]" + " Error deleting book: " + response.statusText);
    //     dispatch("error")
    //   }
</script>

<Popup
    {id}
    message={"Delete reading activity of book: " +
        deletionEntry?.book.name +
        "?"}
    btn1_msg="Delete entry"
    btn2_msg="cancel"
    type="Error"
    onClick={deleteEntry}>
    {#snippet content()}
        <div>
            You won't be able to restore this entry, unless you create a new
            one.
            <div>
                Details:
                <br />
                ID: {deletionEntry.id}
                <br />
                Status: {deletionEntry.status.status}
                <br />
                Date started: {formatShort(deletionEntry.dateStarted)}
                <br />
                Date finished: {formatShort(deletionEntry.dateFinished)}
            </div>
        </div>
    {/snippet}
</Popup>
