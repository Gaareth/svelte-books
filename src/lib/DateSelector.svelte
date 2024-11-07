<script lang="ts">
  import ToggleGroup from "./ToggleGroup.svelte";
  import { dateToYYYY_MM_DD, isValidDate } from "./utils";

  export let label: string;
  export let name: string;

  export let datetime: {
    dateString: string;
    timeString: string;
  } = { dateString: "", timeString: "" };

  let dateString: string | undefined = undefined;

  let selectedOption: "last month" | "this month" | "today" | undefined;

  let year: number;
  let month: number;
  let day: number | undefined;

  let timeString: string | undefined;

  let errorMessage: string | undefined;

  let date2: Date = new Date();
  // $: {
  //   // date2 = new Date();

  //   date2.setFullYear(year);
  //   date2.setMonth(month);
  //   date2.setDate(day!);

  //   // date2 = new Date(date2);
  //   if (day != null && !isValidDate(year, month, day)) {
  //     errorMessage = `${year}-${month.toString().padStart(2, "0")}-${day
  //       .toString()
  //       .padStart(2, "0")} does not exist`;
  //   } else {
  //     errorMessage = undefined;
  //   }

  //   console.log(date2);
  //   console.log(optionToDate(selectedOption));

  //   const quickselectDate = optionToDate(selectedOption);
  //   if (
  //     (selectedOption == "today" &&
  //       date2.getTime() != quickselectDate?.getTime()) ||
  //     (selectedOption != "today" && quickselectDate?.getMonth() != month) ||
  //     (day != null && quickselectDate?.getFullYear)
  //   ) {
  //     selectedOption = undefined;
  //   }
  // }

  // $: {
  //   year; month; day;
  //   selectedOption = undefined;
  //   console.log("AAA");
  // }

  const optionToDate = (option: typeof selectedOption) => {
    const now = new Date();

    switch (option) {
      case "last month":
        return {
          year: now.getFullYear(),
          month: now.getMonth() - 1,
          day: undefined,
        };

      case "this month":
        return {
          year: now.getFullYear(),
          month: now.getMonth(),
          day: undefined,
        };

      case "today":
        return {
          year: now.getFullYear(),
          month: now.getMonth(),
          day: now.getDate(),
        };
    }
  };

  const onQuickselect = (option: typeof selectedOption) => {
    let date = optionToDate(option);
    day = undefined;

    console.log(date);
    
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
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  // Array of days (1 to 31)
  const days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
</script>

<label for="dateFinished" class="col-span-2 sm:col-span-1">
  {label}
</label>

<div class="relative">
  <input
    class="border"
    type="text"
    value={dateString}
    on:click={togglePopover}
  />
  <fieldset
    class="max-w-96 w-auto z-10 absolute mt-1 p-3 border dark:bg-slate-700/90 flex flex-col bg-white/70 backdrop-blur"
    hidden={showPopover}
  >
    <legend class="text-lg">Select Datetime</legend>
    <div class="flex justify-center">
      <ToggleGroup
        options={["last month", "this month", "today"]}
        groupClass="mb-2 inline-flex"
        btnClass="px-2 dark:hover:bg-slate-500 border border-s-0 dark:border-slate-500 dark:bg-slate-600"
        btnSelectedClass="dark:bg-slate-500"
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
          required
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
          <div class="ml-auto pb-1">
            <button
              type="button"
              class="border px-1 py-0 rounded-md text-base btn-generic btn-generic-color-2"
              disabled={timeString == undefined}
              on:click={() => {
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
                timeString = now.getHours() + ":" + now.getMinutes();
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

      <p hidden={errorMessage == null} class="text-error">{errorMessage}</p>
    </div>
  </fieldset>
</div>

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
