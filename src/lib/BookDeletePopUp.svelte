<script lang="ts">
  import { goto } from "$app/navigation";
  import toast from "svelte-french-toast";
  import Popup from "./Popup.svelte";

  export let name: string;
  export let id: string;
  export let openModal: boolean;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  const deleteBook = async (event: any) => {
    const response = await fetch("/book/" + name + "/delete", {
      method: "POST",
      body: JSON.stringify({ id: id }),
    });
    const { success } = await response.json();

    if (success) {
      toast.success("Successfully deleted book");
      
      dispatch("success")
    } else {
      toast.error("Error deleting book");
      dispatch("error")
    }
  };
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
