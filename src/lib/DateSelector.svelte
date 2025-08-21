<script context="module" lang="ts">
  export type OptionalDate = {
    year: number | undefined;
    month: number | null;
    day: number | null;

    hour: number | null;
    minute: number | null;
    timezoneOffset: number | null;
  };

  export const DEFAULT_OPTIONAL_DATETIME = {
    year: undefined,
    month: null,
    day: null,

    hour: null,
    minute: null,
    timezoneOffset: null,
  };

  export const formatOptionalDate = (d: OptionalDate, includeTime = true) => {
    if (d == null || d.year == null) return "?";

    const placeholder = "??";

    const mo = d.month?.toString().padStart(2, "0") ?? placeholder;
    const da = d.day?.toString().padStart(2, "0") ?? placeholder;
    const dateString = `${d.year}-${mo}-${da}`;

    const hour =
      d.hour != null ? d.hour?.toString().padStart(2, "0") : placeholder;
    const minute = d.minute?.toString().padStart(2, "0") ?? placeholder;

    const timeString = `${hour}:${minute}`;
    return dateString + (includeTime ? " " + timeString : "");
  };

  export const formatTime = (d: OptionalDate) => {
    const hour = d.hour?.toString().padStart(2, "0");
    const minute = d.minute?.toString().padStart(2, "0");

    return `${hour}:${minute}`;
  };

  export const formatShort = (d: OptionalDate | null, includeTime = false) => {
    if (d == null || d.year == null) return "?";

    const mo = d.month?.toString().padStart(2, "0");
    const da = d.day?.toString().padStart(2, "0");
    let dateString = `${d.year}`;

    if (mo) {
      dateString += `-${mo}`;
    }

    if (da) {
      dateString += `-${da}`;
    }

    if (includeTime && d.hour != null && d.minute != null) {
      dateString += " " + formatTime(d);
    }

    return dateString;
  };
</script>

<script lang="ts">
  import { twMerge } from "tailwind-merge";
  //@ts-ignore

  import ClearButton from "./ClearButton.svelte";
  import Dropdown from "./Dropdown.svelte";
  import ToggleGroup from "./ToggleGroup.svelte";
  import { isValidDate } from "./utils";

  export let id: string | undefined = undefined;
  export let name: string | undefined = undefined;

  export let className: string | undefined = undefined;
  export let inputClassName: string | undefined = undefined;

  export let clearButton = false;

  export let datetime: OptionalDate;

  const NULL_DATETIME = {
    year: undefined,
    month: null,
    day: null,

    hour: null,
    minute: null,
    timezoneOffset: null,
  };

  $: {
    if (datetime == null) {
      datetime = NULL_DATETIME;
    }
  }

  let dateString: string | undefined = undefined;
  $: {
    dateString = formatOptionalDate(datetime);
  }

  let selectedOption: "last month" | "this month" | "today" | undefined =
    undefined;

  // let year: number;
  // let month: number | undefined;
  // let day: number | undefined;

  let timeString: string | undefined;

  $: {
    if (timeString != null) {
      datetime.hour = Number(timeString.split(":")[0]);
      datetime.minute = Number(timeString.split(":")[1]);
    }

    if (datetime != null && datetime.hour != null && datetime.minute != null) {
      timeString = formatTime(datetime);
    } else {
      // timeString = undefined;
      // console.log("undf");
    }
  }

  let errorMessage: string | undefined;

  $: {
    if (
      datetime.year != null &&
      datetime.day != null &&
      datetime.month != null &&
      !isValidDate(datetime.year, datetime.month - 1, datetime.day)
    ) {
      errorMessage = `${datetime.year}-${datetime.month
        .toString()
        .padStart(2, "0")}-${datetime.day
        .toString()
        .padStart(2, "0")} does not exist`;
    } else {
      errorMessage = undefined;
    }

    if (selectedOption !== undefined) {
      const quickselectDate = optionToDate(selectedOption);

      // reset selection if year or month, ... was changed and is not corresponding to a quick selection anymore
      if (
        quickselectDate != null &&
        (quickselectDate.year !== datetime.year ||
          quickselectDate.month !== datetime.month ||
          quickselectDate.day !== datetime.day)
      ) {
        selectedOption = undefined;
      }
    }
  }

  const optionToDate = (option: typeof selectedOption) => {
    const now = new Date();
    // now.getMonth() returns zero based months, this function returns 1 based months

    switch (option) {
      case "last month":
        return {
          year: now.getFullYear(),
          month: now.getMonth() == 0 ? 12 : now.getMonth() - 1 + 1,
          day: null,
        };

      case "this month":
        return {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: null,
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
    datetime.day = null;
    if (date != null) {
      datetime.year = date.year;
      datetime.month = date.month;
      datetime.day = date.day;
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
  bind:open={showPopover}>
  <div slot="triggerWrapper" class="flex gap-2">
    <input
      class={twMerge(inputClassName)}
      value={dateString}
      on:click={togglePopover}
      {id}
      readonly />
    {#if clearButton}
      <ClearButton
        value={datetime}
        clearSelection={() => {
          datetime = {
            year: undefined,
            month: null,
            day: null,

            hour: null,
            minute: null,
            timezoneOffset: null,
          };
          showPopover = false;
        }}
        isValueNull={datetime == null || datetime.year == undefined} />
    {/if}
  </div>

  <div
    class=" max-w-96 w-auto p-3 border rounded-md dark:border-slate-500 dark:bg-slate-700 flex flex-col bg-white"
    slot="dropdown">
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
        }} />
    </div>

    <!-- <div class="border w-96 h-20"></div> -->

    <div class="flex flex-col gap-2">
      <div class="col-span-2">
        <label for="year">
          Year
          <span class="text-red-400" title="required">*</span>
        </label>
        <input
          type="number"
          id="year"
          bind:value={datetime.year}
          placeholder="YYYY"
          class="w-full btn-generic-color-2"
          name={`${name}[year]`} />
      </div>

      <div class="grid grid-cols-2 gap-1">
        <!-- Month (Optional) -->
        <div>
          <label for="month">Month</label>
          <select
            id="month"
            bind:value={datetime.month}
            class="btn-generic-color-2 w-full"
            name={`${name}[month]`}>
            <option value={null}>Select Month</option>
            {#each months as { value, label }}
              <option {value}>{label}</option>
            {/each}
          </select>
        </div>

        <!-- Day (Optional) -->
        <div>
          <label for="day">Day</label>
          <select
            id="day"
            bind:value={datetime.day}
            class="btn-generic-color-2 w-full"
            name={`${name}[day]`}>
            <option value={null}>Select Day</option>
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
                datetime.hour = null;
                datetime.minute = null;
              }}>
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
              }}>
              now
            </button>
          </div>
        </div>

        <input type="hidden" name={`${name}[hour]`} value={datetime.hour} />
        <input type="hidden" name={`${name}[minute]`} value={datetime.minute} />

        <input
          type="time"
          id="minute"
          class="w-full btn-generic-color-2"
          bind:value={timeString} />
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
