<script lang="ts">
  const toggle = (event: Event) => {
    let target = event.target as HTMLButtonElement;

    target.ariaPressed = (!(target.ariaPressed === "true")).toString();
  };
</script>

<span class="btn-group">
  <label>
    <span>=</span>
    <input type="radio" name="rel" >
  </label>
  <label>
    <span>&lt;</span>
    <input type="radio" name="rel" >
  </label>
  <label>
    <span>&gt;</span>
    <input type="radio" name="rel" >
  </label>

</span>

<style lang="postcss">
  /* .btn-group > label {
    @apply btn-group-btn flex flex-col items-center text-black text-lg;
  }

  .btn-group > label > span {
    @apply -mt-2
  } */
</style>
