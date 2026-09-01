import { optionalToDate } from "./dateUtils";
import { getRandomIntInclusive } from "./utils";

import type { Prisma } from "$prismaClient";

const HOUR_IN_SECONDS = 1000 * 60 * 60;
const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24;
const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7;
const MONTH_IN_SECONDS = DAY_IN_SECONDS * 30;

type ReadingActivityWithDates = Prisma.ReadingActivityGetPayload<{
    include: {
        dateStarted: true;
        dateFinished: true;
    };
}>;

export function generateBookFinishedCongratulations(
    entry: ReadingActivityWithDates,
): string {
    const placeholder = [
        "Good job finishing that book!",
        "Nice one!, you did so well",
        "Congrats on finishing the book!!",
        "You successfully put the book from reading to read",
    ];
    const randomMessage =
        placeholder[Math.floor(Math.random() * placeholder.length)];

    const startDate = optionalToDate(entry.dateStarted);
    const endDate = optionalToDate(entry.dateFinished);
    if (startDate && endDate) {
        const duration = endDate.getTime() - startDate?.getTime();
        if (duration < 12 * HOUR_IN_SECONDS) {
            const hours = Math.floor(duration / HOUR_IN_SECONDS);
            return `Woah you are incredible fast, just ${hours} hours! I hope you did not forget to take care of yourself`;
        } else if (duration < DAY_IN_SECONDS) {
            return "Under one day?! Call yourself a speader (speed + reader). You are sooo cooool!!";
        } else if (duration > 3 * MONTH_IN_SECONDS) {
            const months = Math.floor(duration / MONTH_IN_SECONDS);
            return `Wow.. ${months} months. That is a looooooong time. But congratzz to finishing it! This shows how strong you are!`;
        }

        const random = getRandomIntInclusive(0, 9);
        if (duration < WEEK_IN_SECONDS && random < 3) {
            const days = Math.floor(duration / DAY_IN_SECONDS);
            return `You are really fast! Only ${days} days! Not bad..`;
        } else {
            return randomMessage;
        }
    }

    return randomMessage;
}
