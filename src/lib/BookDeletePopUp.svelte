<script lang="ts">
  import { goto } from "$app/navigation";
  import toast from "svelte-french-toast";
  import Popup from "./Popup.svelte";

  export let name: string;
  export let id: string;
  export let openModal: boolean;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  const deleteBook = (event: any) => {
    let res = new Promise((resolve, reject) => {
      fetch("/book/" + name + "/delete", {
        method: "POST",
        body: JSON.stringify({ id: id }),
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
      loading: "Deleting book" + "'" + name + "'",
      success: "Successfully deleted book " + "'" + name + "'!",
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
  message={"Delete book: " + name + "?"}
  content={"You won't be able to restore this book, unless you create a new one"}
  btn1_msg={"Delete book"}
  btn2_msg={"cancel"}
  type={"Error"}
  on:primary={deleteBook}
/>
