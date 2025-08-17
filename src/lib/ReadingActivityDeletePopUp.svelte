<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import toast from "svelte-french-toast";
  import Popup from "./Popup.svelte";
  import type { Prisma } from "@prisma/client";
  import { formatShort } from "./DateSelector.svelte";

  export let openModal: boolean;
  export let deletionEntry: Prisma.ReadingActivityGetPayload<{
    include: { book: true; dateFinished: true; dateStarted: true };
  }>;
  const dispatch = createEventDispatcher();

  const deleteEntry = (event: any) => {
    let res = new Promise((resolve, reject) => {
      fetch("/api/reading-activity/delete", {
        method: "POST",
        body: JSON.stringify({ id: deletionEntry.id }),
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
  bind:showModal={openModal}
  message={"Delete reading activity of book: " + deletionEntry?.book.name + "?"}
  btn1_msg={"Delete entry"}
  btn2_msg={"cancel"}
  type={"Error"}
  on:primary={deleteEntry}>
  <div slot="content">
    You won't be able to restore this entry, unless you create a new one.
    <div>
      Details:
      <br />
      ID: {deletionEntry.id}
      <br />
      Status: {deletionEntry.status}
      <br />
      Date started: {formatShort(deletionEntry.dateStarted)}
      <br />
      Date finished: {formatShort(deletionEntry.dateFinished)}
    </div>
  </div>
</Popup>
