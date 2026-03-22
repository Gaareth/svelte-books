import type { ReadingActivityList } from "$src/app";
import type { OptionalDate } from "../components/input/DateSelector.svelte";
import {
  FINISHED,
  READING_ACTIVITY_TYPES,
  type ReadingActivityStatusType,
} from "../constants/enums";
import { optionalToDate, sortReadingActivityReversed, sum } from "./utils";

export function calc_most_read_categories(
  entries: ReadingActivityList[]
): [string, number][] {
  const category_count_map = new Map<string, number>();
  entries.forEach((entry) => {
    entry.book.bookApiData?.categories.forEach(({ name }) => {
      category_count_map.set(name, (category_count_map.get(name) || 0) + 1);
    });
  });
  return Array.from(category_count_map).sort(([, a], [, b]) => b - a);
}

const AVERAGE_NUM_WORDS_PER_PAGE = 250;
const AVERAGE_NUM_PAGES_PER_BOOK = 350;

export const count_pages = (entries: ReadingActivityList[]) =>
  sum(
    entries.map(
      (e) => e.book.bookApiData?.pageCount ?? AVERAGE_NUM_PAGES_PER_BOOK
    )
  );

export const count_words = (entries: ReadingActivityList[]) =>
  sum(
    entries.map(
      (e) =>
        (e.book.bookApiData?.pageCount ?? AVERAGE_NUM_PAGES_PER_BOOK) *
        (e.book.wordsPerPage ?? AVERAGE_NUM_WORDS_PER_PAGE)
    )
  );

export const calc_most_read_authors = (entries: ReadingActivityList[]) => {
  const author_occur: Record<string, number> = {};
  entries.forEach((e) => {
    const author = e.book.author;
    author_occur[author] = (author_occur[author] || 0) + 1;
  });
  return Object.entries(author_occur).sort(([, a], [, b]) => b - a);
};

export const books_read_per_year = (
  year: number,
  activities: ReadingActivityList[]
) => activities.filter((e) => e.dateFinished?.year === year);

export const books_read_per_month = (
  month: number,
  year: number,
  activities: ReadingActivityList[]
) =>
  activities.filter(
    (e) =>
      e.dateFinished?.year === year &&
      e.dateFinished?.month !== null &&
      e.dateFinished.month === (month === 0 ? 12 : month)
  );

// TOOD: return historgram
export function get_reading_duration(readingActivities: ReadingActivityList[]) {
  let totalDuration = 0;
  let count = 0;
  let histogram: [string, number][] = [];

  for (const activity of readingActivities) {
    if (
      !activity.dateStarted ||
      !activity.dateFinished ||
      activity.status.status !== READING_ACTIVITY_TYPES.FINISHED
    ) {
      continue; // Skip if either date is missing
    }

    const startDate = optionalToDate(activity.dateStarted);
    const endDate = optionalToDate(activity.dateFinished);
    if (!startDate || !endDate) {
      continue;
    }

    const duration = endDate.getTime() - startDate.getTime();
    if (duration < 0) {
      console.warn(
        "Found negative duration:",
        duration,
        "for activity:",
        activity
      );
      continue;
    }

    histogram.push([activity.book.name, duration]);

    totalDuration += duration;
    count++;
  }

  return {
    averageDuration_ms: count > 0 ? totalDuration / count : 0,
    totalDuration_ms: totalDuration,
    histogram_ms: histogram,
  };
}

function optDateFallback(
  activity: ReadingActivityList,
  optDate: OptionalDate | null | undefined
) {
  if (optDate) {
    return optionalToDate(optDate);
  } else {
    return activity.createdAt;
  }
}

type GetAverageTimeOptions = {
  startStatus?: ReadingActivityStatusType;
  endStatus?: ReadingActivityStatusType;
  startStatusEqFn?: (status: ReadingActivityStatusType) => boolean;
  endStatusEqFn?: (status: ReadingActivityStatusType) => boolean;
  getStartDate?: (activity: ReadingActivityList) => Date | null;
  getEndDate?: (activity: ReadingActivityList) => Date | null;
};

export function get_average_time_til_status(
  readingActivities: ReadingActivityList[],
  options: GetAverageTimeOptions
) {
  const {
    startStatus,
    endStatus,
    startStatusEqFn,
    endStatusEqFn,
    getStartDate,
    getEndDate,
  } = options;

  if ((!startStatus && !startStatusEqFn) || (!endStatus && !endStatusEqFn)) {
    ("Either startStatus or startStatusEqFn and endStatus or endStatusEqFn must be provided");
  }

  const startEq = startStatusEqFn ?? ((status) => status === startStatus);

  const endEq = endStatusEqFn ?? ((status) => status === endStatus);

  const defaultStartDate = (activity: ReadingActivityList) =>
    optDateFallback(activity, activity.dateStarted);
  const defaultEndDate = (activity: ReadingActivityList) =>
    optDateFallback(activity, activity.dateFinished ?? activity.dateStarted);
  const resolveStartDate = getStartDate ?? defaultStartDate;
  const resolveEndDate = getEndDate ?? defaultEndDate;

  const groupedByBook = readingActivities.reduce((acc, activity) => {
    const bookId = activity.book.id;
    if (!acc[bookId]) {
      acc[bookId] = [];
    }
    acc[bookId].push(activity);
    return acc;
  }, {} as Record<string, ReadingActivityList[]>);

  let totalDuration: number = 0;
  let count: number = 0;

  // to-read -> acquired
  // acquired -> reading
  // to-read -> reading
  for (const bookId in groupedByBook) {
    // reversed sorting, as default shows latest first (new -> to) , and reversed is old -> new
    const activities = groupedByBook[bookId]
      .slice()
      .sort(sortReadingActivityReversed);

    const startActivityIndex = activities.findIndex((a) =>
      startEq(a.status.status)
    );
    if (startActivityIndex === -1) {
      continue; // no start status, skip
    }

    const startActivity = activities[startActivityIndex];

    // to avoid situations where reading is before to-read, only look at entries after the start status
    const restActivities = activities.slice(startActivityIndex + 1);

    const endActivity = restActivities.find((a) => endEq(a.status.status));
    if (!endActivity) {
      continue; // no end status, skip
    }
    const startDate = resolveStartDate(startActivity);
    const endDate = resolveEndDate(endActivity);

    if (!startDate || !endDate) continue;

    const duration = endDate.getTime() - startDate.getTime();

    // guard against negative durations (bad data)
    if (duration < 0) {
      console.log("Found negative duration:", duration, "for bookId:", bookId);
      continue;
    }

    totalDuration += endDate.getTime() - startDate.getTime();
    count++;
  }

  return {
    averageDuration_ms: count > 0 ? totalDuration / count : 0,
    totalDuration_ms: totalDuration,
  };
}

export function get_average_acquisition_time(
  readingActivities: ReadingActivityList[]
) {
  const readingOrFinished = (status: ReadingActivityStatusType) =>
    status === READING_ACTIVITY_TYPES.READING ||
    status === READING_ACTIVITY_TYPES.FINISHED;

  const getReadingStartedDate = (activity: ReadingActivityList) =>
    activity.status.status === FINISHED
      ? optDateFallback(activity, activity.dateStarted)
      : optDateFallback(
          activity,
          activity.dateStarted ?? activity.dateFinished
        );

  const to_read_to_acquired = get_average_time_til_status(readingActivities, {
    startStatus: READING_ACTIVITY_TYPES.TO_READ,
    endStatus: READING_ACTIVITY_TYPES.ACQUIRED,
  });

  const acquired_to_reading = get_average_time_til_status(readingActivities, {
    startStatus: READING_ACTIVITY_TYPES.ACQUIRED,
    endStatusEqFn: readingOrFinished,
    getEndDate: getReadingStartedDate,
  });

  // todo: list to-read show only with active or show all
  const to_read_to_reading = get_average_time_til_status(readingActivities, {
    startStatus: READING_ACTIVITY_TYPES.TO_READ,
    endStatusEqFn: readingOrFinished,
    getEndDate: getReadingStartedDate,
  });

  return {
    avg_to_read_to_acquired_days: (
      to_read_to_acquired.averageDuration_ms /
      (1000 * 60 * 60 * 24)
    ).toFixed(0),
    avg_acquired_to_reading_days: (
      acquired_to_reading.averageDuration_ms /
      (1000 * 60 * 60 * 24)
    ).toFixed(0),
    avg_to_read_to_reading_days: (
      to_read_to_reading.averageDuration_ms /
      (1000 * 60 * 60 * 24)
    ).toFixed(0),
  };
}
