<script lang="ts">
    import toast from "svelte-french-toast";

    import type { Book } from "$prismaBrowser";

    import Popup from "$components/Popup.svelte";

    interface Props {
        openModal: boolean;
        deletionBook: Book;
        onSuccess: () => void;
        onError?: () => void;
    }

    let {
        openModal = $bindable(),
        deletionBook,
        onSuccess,
        onError,
    }: Props = $props();

    const deleteBook = () => {
        let res = new Promise((resolve, reject) => {
            fetch("delete", {
                method: "POST",
                body: JSON.stringify({ id: deletionBook.id }),
            }).then((response) => {
                response.json().then(({ success }) => {
                    if (success) {
                        resolve(true);
                        onSuccess();
                    } else {
                        reject(response);
                        onError?.();
                    }
                });
            });
        });

        // TODO: give more info upon error, by moving into block above
        toast.promise(res, {
            loading: "Deleting book" + "'" + deletionBook.name + "'",
            success:
                "Successfully deleted book " + "'" + deletionBook.name + "'!",
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
    bind:showModal={openModal}
    message={"Delete book: " + deletionBook?.name + "?"}
    btn1_msg="Delete book"
    btn2_msg="cancel"
    type="Error"
    onClick={deleteBook}>
    {#snippet content()}
        You won't be able to restore this book, unless you create a new one
    {/snippet}
</Popup>
