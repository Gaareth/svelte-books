<script lang="ts">
  import type { Book } from "@prisma/client";
  import { createEventDispatcher } from "svelte";
  import toast from "svelte-french-toast";
  import Popup from "./Popup.svelte";

  export let openModal: boolean;
  export let deletionBook: Book;
  const dispatch = createEventDispatcher();

  const deleteBook = (event: any) => {
    let res = new Promise((resolve, reject) => {
      fetch("/book/" + deletionBook.name + "/delete", {
        method: "POST",
        body: JSON.stringify({ id: deletionBook.id }),
      }).then((response) => {
        response.json().then(({ success }) => {
          if (success) {
            resolve(true);
            dispatch("success");
          } else {
            reject(response);
            dispatch("error");
          }
        });
      });
    });

    // TODO: give more info upon error, by moving into block above
    toast.promise(res, {
      loading: "Deleting book" + "'" + deletionBook.name + "'",
      success: "Successfully deleted book " + "'" + deletionBook.name + "'!",
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
  content={"You won't be able to restore this book, unless you create a new one"}
  btn1_msg={"Delete book"}
  btn2_msg={"cancel"}
  type={"Error"}
  on:primary={deleteBook}
/>
