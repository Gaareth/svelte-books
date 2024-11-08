<script lang="ts">
  import { string } from "zod";
  import Dropdown from "./Dropdown.svelte";
  import ToggleGroup from "./ToggleGroup.svelte";
  import { dateToYYYY_MM_DD, isValidDate } from "./utils";

  export let id: string | undefined = undefined;
  export let className: string | undefined = undefined;

  let datetime: {
    year: number;
    month: number | undefined;
    day: number | undefined;

    hour: number | undefined;
    minute: number | undefined;
    timezoneOffset: number | undefined;
  };

  let dateString: string | undefined = undefined;
  $: {
    const mo = month?.toString().padStart(2, "0") ?? "??";
    const da = day?.toString().padStart(2, "0") ?? "??";

    dateString =
      year != null ? `${year}-${mo}-${da} ${timeString ?? "??:??"}` : "?";
  }

  let selectedOption: "last month" | "this month" | "today" | undefined;

  let year: number;
  let month: number | undefined;
  let day: number | undefined;

  let timeString: string | undefined;

  $: {
    datetime = {
      year,
      month,
      day,
      hour: Number(timeString?.split(":")[0]),
      minute: Number(timeString?.split(":")[1]),
      timezoneOffset: new Date().getTimezoneOffset(),
    };
  }

  let errorMessage: string | undefined;

  $: {
    if (
      year != null &&
      day != null &&
      month != null &&
      !isValidDate(year, month - 1, day)
    ) {
      errorMessage = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")} does not exist`;
    } else {
      errorMessage = undefined;
    }

    const quickselectDate = optionToDate(selectedOption);
    if (
      quickselectDate != null &&
      (quickselectDate.year !== year ||
        quickselectDate.month !== month ||
        quickselectDate.day !== day)
    ) {
      selectedOption = undefined;
    }
  }

  const optionToDate = (option: typeof selectedOption) => {
    const now = new Date();
    // zero based months
    switch (option) {
      case "last month":
        return {
          year: now.getFullYear(),
          month: now.getMonth() - 1 + 1,
          day: undefined,
        };

      case "this month":
        return {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: undefined,
        };

      case "today":
        return {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: now.getDate(),
        };
    }
  };

  const onQuickselect = (option: typeof selectedOption) => {
    let date = optionToDate(option);
    day = undefined;

    if (date !== undefined) {
      year = date?.year;
      month = date?.month;
      day = date?.day;
    }

    // const dtString = dateToYYYY_MM_DD(date);
    // datetime.dateString = dtString;
    // return dtString;
  };

  let showPopover = false;

  function togglePopover() {
    showPopover = !showPopover;
  }

  // Type for month objects
  type Month = {
    value: number;
    label: string;
  };

  // Array of months (1-based indexing)
  const months: Month[] = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Array of days (1 to 31)
  const days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
</script>

<Dropdown
  {className}
  contentClass="!border-0 !p-0 !bg-transparent"
  closeOnClick={false}
  bind:open={showPopover}
>
  <input
    class="btn-generic-color-2 rounded-md w-full sm:w-auto"
    value={dateString}
    on:click={togglePopover}
    slot="triggerWrapper"
    {id}
  />

  <div
    class=" max-w-96 w-auto p-3 border rounded-md dark:border-slate-500 dark:bg-slate-700 flex flex-col bg-white"
    slot="dropdown"
  >
    <p class="text-xl mb-2 sm:text-lg sm:top-0 sm:absolute">Select Datetime</p>
    <div class="flex justify-center sm:mt-5">
      <ToggleGroup
        options={["last month", "this month", "today"]}
        groupClass="mb-2 inline-flex"
        btnClass="px-2 py-2 sm:py-0 hover:bg-gray-50 dark:hover:bg-slate-500 border border-s-0 dark:border-slate-500 dark:bg-slate-600"
        btnSelectedClass="dark:bg-slate-500 bg-gray-100"
        startClass="border-s rounded-s-md"
        endClass="rounded-e-md"
        bind:selectedOption
        on:select={(ev) => {
          console.log(ev.detail);
          onQuickselect(ev.detail);
        }}
        defaultOption={1}
      />
    </div>

    <!-- <div class="border w-96 h-20"></div> -->

    <div class="flex flex-col gap-2">
      <div class="col-span-2">
        <label for="year">
          Year
          <span class="text-red-400" title="required">*</span></label
        >
        <input
          type="number"
          id="year"
          bind:value={year}
          placeholder="YYYY"
          class="w-full btn-generic-color-2"
        />
      </div>

      <div class="flex gap-1">
        <!-- Month (Optional) -->
        <div>
          <label for="month">Month</label>
          <select id="month" bind:value={month} class="btn-generic-color-2">
            <option value="">Select Month</option>
            {#each months as { value, label }}
              <option {value}>{label}</option>
            {/each}
          </select>
        </div>

        <!-- Day (Optional) -->
        <div>
          <label for="day">Day</label>
          <select id="day" bind:value={day} class="btn-generic-color-2">
            <option value={undefined}>Select Day</option>
            {#each days as dayNumber}
              <option value={dayNumber}>{dayNumber}</option>
            {/each}
          </select>
        </div>
      </div>

      <div>
        <!-- time (Optional) -->
        <div class="flex items-center">
          <label for="minute">Time</label>
          <div class="ml-auto pb-1 hidden sm:block">
            <button
              type="button"
              class="border px-1 py-0 rounded-md text-base btn-generic btn-generic-color-2"
              disabled={timeString == undefined}
              on:click={(e) => {
                e.preventDefault();
                timeString = undefined;
              }}
            >
              clear
            </button>
            <button
              type="button"
              class="border px-1 py-0 rounded-md text-base btn-generic btn-generic-color-2"
              on:click={() => {
                const now = new Date();
                timeString =
                  now.getHours().toString().padStart(2, "0") +
                  ":" +
                  now.getMinutes().toString().padStart(2, "0");
              }}
            >
              now
            </button>
          </div>
        </div>

        <input
          type="time"
          id="minute"
          class="w-full btn-generic-color-2"
          bind:value={timeString}
        />
      </div>
      <!-- 
  <label class="mt-5">
    Datetime:
    <input type="date" class="w-full" bind:value={dateString} />
  </label> -->

      <p hidden={errorMessage == null} class="text-error !text-xl">
        {errorMessage}
      </p>
    </div>
  </div>
</Dropdown>

<!-- <div
  class="flex flex-wrap gap-1 sm:gap-2 col-span-2 sm:col-span-3 sm:ml-auto justify-center sm:justify-normal -mt-2 sm:mt-0"
>
  <ToggleGroup
    options={["last month", "this month", "today"]}
    groupClass="inline-flex border rounded-md dark:border-slate-500 dark:bg-slate-600"
    btnClass="px-2 dark:hover:bg-slate-500"
    btnSelectedClass="dark:bg-slate-500"
    bind:selectedOption
    defaultOption={1}
  />

  <input
    bind:value={dateString}
    type="date"
    {name}
    id={name}
    class="dark:border-slate-500 dark:bg-slate-600 rounded-md py-0"
  />

  <input
    bind:value={datetime.timeString}
    type="time"
    class="dark:border-slate-500 dark:bg-slate-600 rounded-md py-0"
  />
</div> -->

<style>
</style>
