import { error, fail, redirect, type ServerLoadEvent } from "@sveltejs/kit";
import { z } from "zod";

import { getBookApiData } from "../../../book/api/api.server";

import type { Actions, RequestEvent } from "./$types";

import {
    authorize,
    handlePublicOrAuthenticatedAccount,
} from "$lib/auth/authorization";
import { optionalNumericString } from "$lib/schemas/utils";
import {
    extractBookApiData,
    extractCategories,
    loadBooks,
} from "$lib/server/db/utils";
import { prisma } from "$lib/server/prisma";
import { publicConfig } from "$src/lib/config/public";
import {
    createImageUploadSchema,
    type ImageTypes,
} from "$src/lib/schemas/schemas";
import { whereVisibilityPublicOrAuthenticatedOrAll } from "$src/lib/server/db/prismaUtils";
import {
    cacheUploadedImage,
    deleteCachedImage,
    saveCachesToDB,
} from "$src/lib/server/images/images";
import { removeFilesFromFormData } from "$src/lib/utils/formUtils";

export async function load(page: ServerLoadEvent) {
    const params = page.params;
    const session = await page.locals.auth();
    // console.log("Session:", session);
    const { sessionAccount, requestedAccount } = await authorize(
        session,
        params.username,
        handlePublicOrAuthenticatedAccount,
    );

    const isAuthorizedToModify =
        (sessionAccount?.id === requestedAccount.id ||
            sessionAccount?.isAdmin) ??
        false;

    const edit = page.url.searchParams.get("edit");
    const showForms = edit !== "false" && edit !== null && isAuthorizedToModify;

    const book = await prisma.book.findFirst({
        where: {
            name: params.name,
            accountId: requestedAccount?.id,
        },
        include: {
            ownership: true,
            bookList: true,
            coverImage: {
                include: {
                    variants: true,
                },
            },
            bookApiData: {
                include: {
                    categories: true,
                },
            },
            readingActivity: {
                where: {
                    status: whereVisibilityPublicOrAuthenticatedOrAll(
                        session,
                        isAuthorizedToModify,
                    ),
                },
                include: {
                    dateStarted: true,
                    dateFinished: true,
                    rating: true,
                    storyGraphs: true,
                    book: true,
                    status: true,
                },
            },
            bookSeries: {
                include: {
                    books: {
                        include: {
                            coverImage: {
                                include: {
                                    variants: true,
                                },
                            },
                            bookApiData: {
                                include: {
                                    categories: true,
                                },
                            },
                            readingActivity: {
                                where: {
                                    status: whereVisibilityPublicOrAuthenticatedOrAll(
                                        session,
                                        isAuthorizedToModify,
                                    ),
                                },
                                include: {
                                    dateStarted: true,
                                    dateFinished: true,
                                    rating: true,
                                    storyGraphs: true,
                                    book: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const bookLists = await prisma.bookList.findMany({
        where: {
            accountId: requestedAccount.id,
        },
    });

    if (!book) {
        error(404, { message: "Not found" });
    }

    const books = await loadBooks(
        { accountId: requestedAccount.id },
        undefined,
    );

    return {
        book,
        books,
        bookLists,
        edit,
        showForms,
        headerConfig: {
            transparent: true,
            wrapperClass: "lg:max-w-6xl",
        },
        isAuthorizedToModify,
    };
}

const coverSourceSchema = z
    .object({
        // googleBooksCoverVolumeId: z.string().trim().nullish(),
        uploadedCoverImage: createImageUploadSchema(
            publicConfig.imageUploads.allowedTypes as ImageTypes[],
            publicConfig.imageUploads.maxFileSize,
        ).nullish(),
    })
    .refine(
        ({ uploadedCoverImage }) =>
            uploadedCoverImage == null || publicConfig.imageUploads.enabled,
        {
            message: "Uploaded cover images are disabled",
            path: ["uploadedCoverImage"],
        },
    );

//TODO: reuse
const saveSchema = z
    .object({
        id: z.string(),
        name: z.string().trim().min(1),
        author: z.string().trim().min(1),
        listName: z.string().optional(),
        bookSeries: z.string().array(),
        bookSeriesId: z
            .preprocess(
                (s) => (s != "" ? Number(s) : undefined),
                z.number().optional(),
            )
            .optional(),
        apiVolumeId: z.string().optional(),
        wordsPerPage: optionalNumericString(
            z.coerce.number().nonnegative().optional(),
        ).optional(),

        description: z.string().trim().optional(),
    })
    .and(coverSourceSchema);

//TODO: check if a book in the new books is already part of a bookseries, then add to it
async function updateBookSeries(
    bookId: string,
    accountId: string,
    bookSeries: string[],
    bookSeriesId: number | undefined,
) {
    if (bookSeriesId === undefined && bookSeries.length == 0) {
        return;
    }

    type UniqueInput = "id";

    // removes books in the provided bookSeries[] that do not belong to the specified user
    const filterOwnBooks = async (bId: string) => {
        const book = await prisma.book.findUnique({
            where: {
                id: bId,
            },
        });
        return book?.accountId == accountId;
    };

    // @ts-ignore
    const bookSeriesIds: { [key in UniqueInput]: string }[] = bookSeries
        .filter(filterOwnBooks)
        .map((n) => Object.fromEntries([["id", n]]));

    if (bookSeriesId === undefined) {
        await prisma.bookSeries.create({
            data: {
                books: {
                    connect: [...bookSeriesIds, { id: bookId }],
                },
            },
        });
    } else {
        const currentBookSeries = await prisma.bookSeries.findUnique({
            where: {
                id: bookSeriesId,
            },
            select: {
                books: true,
            },
        });

        if (currentBookSeries === null) {
            error(400);
        }

        const currentBookSeriesIdsArray = currentBookSeries.books.map(
            (b) => b.id,
        );

        // @ts-ignore
        // const currentBookSeriesNames: { [key in UniqueInput]: string }[] =
        //   currentBookSeriesNamesArray.map((n) => Object.fromEntries([["name", n]]));

        // console.log("current");
        // console.log(currentBookSeriesNames);

        // console.log(bookSeriesNames);
        // console.log(bookSeriesNames);

        const oldSeries = currentBookSeriesIdsArray.filter(
            (bId) => !bookSeries.includes(bId),
        );

        // @ts-ignore
        const oldSeriesIds: { [key in UniqueInput]: string }[] = oldSeries.map(
            (n) => Object.fromEntries([["id", n]]),
        );

        // console.log("DISconnecting: ");
        // console.log(oldSeriesIds);

        await prisma.bookSeries.update({
            where: { id: bookSeriesId },
            data: {
                books: {
                    connect: bookSeriesIds,
                    disconnect: oldSeriesIds,
                },
            },
        });
    }
}

type SaveErrors = z.inferFlattenedErrors<typeof saveSchema>["fieldErrors"];
export const actions = {
    save: async (event: RequestEvent) => {
        const account = (
            await authorize(await event.locals.auth(), event.params.username)
        ).requestedAccount;
        const accountId = account.id;

        const f = await event.request.formData();
        const formData = {
            ...Object.fromEntries(f),
            bookSeries: f.getAll("books[]"),
        };
        // console.log("Form data:", formData);

        const result = await saveSchema.safeParseAsync(formData);

        if (result.success) {
            // return;
            const {
                id,
                name,
                author,
                description,
                listName,
                bookSeries,
                bookSeriesId,
                apiVolumeId,
                wordsPerPage,
            } = result.data;

            // don't update if only the book itself is in the series
            if (!(bookSeries.length == 1 && bookSeries[0] == name)) {
                await updateBookSeries(id, accountId, bookSeries, bookSeriesId);
            }

            const allBooks = await prisma.book.findMany();
            if (
                allBooks.find((b) => b.name == name && b.id != id) !== undefined
            ) {
                const errors: SaveErrors = {
                    name: ["Book names have to be unique"],
                };
                return fail(400, {
                    data: formData,
                    errors,
                });
            }

            const apiData = await handleBookApiUpdate(apiVolumeId);

            const coverInfo = {
                uploadedCoverImage: result.data.uploadedCoverImage,
            };
            // console.log("Cover info:", coverInfo);
            const newCoverImage = await handleCoverUpdate(id, coverInfo);

            const book = await prisma.book.update({
                where: { id, accountId },
                data: {
                    name,
                    author,
                    description,
                    bookApiData:
                        apiData?.id !== undefined
                            ? { connect: { id: apiData.id } }
                            : {}, // if not provided, changes nothing
                    wordsPerPage,
                    coverImage:
                        newCoverImage?.id !== undefined
                            ? { connect: { id: newCoverImage.id } }
                            : {}, // if not provided, changes nothing
                },
            });

            redirect(
                302,
                "/" +
                    account.username +
                    "/book/" +
                    encodeURIComponent(book.name),
            );
        }

        const { fieldErrors: errors } = result.error.flatten();
        // console.log("Errors:", errors);
        // console.log("Issues:", result.error.issues);

        const formDataWithoutFiles = removeFilesFromFormData(f);

        return fail(400, {
            data: formDataWithoutFiles,
            errors,
        });
    },
} satisfies Actions;

async function handleCoverUpdate(
    bookId: string,
    coverInfo: z.infer<typeof coverSourceSchema>,
) {
    if (!coverInfo.uploadedCoverImage) {
        return;
    }

    const book = await prisma.book.findUnique({
        where: { id: bookId },
        include: {
            coverImage: {
                include: {
                    variants: true,
                },
            },
        },
    });

    if (book?.coverImage) {
        await deleteCachedImage(book.coverImage);
    }

    let cachedImages;
    if (coverInfo.uploadedCoverImage) {
        cachedImages = await cacheUploadedImage(
            coverInfo.uploadedCoverImage.image,
        );
    }
    // else if (coverInfo.googleBooksCoverVolumeId) {
    //     cachedImages = await cacheGoogleBooksImage(
    //         coverInfo.googleBooksCoverVolumeId,
    //     );
    // }

    if (cachedImages) {
        const newImage = await saveCachesToDB(cachedImages);
        return newImage;
    }
}

async function handleBookApiUpdate(apiVolumeId: string | undefined) {
    let apiData;
    // if apiVolumeId was sent with
    // refetch the data from google and update (or create) it locally
    if (apiVolumeId !== undefined) {
        console.log("Fetching book API data for volumeId:", apiVolumeId);
        apiData = await getBookApiData(apiVolumeId);
        const extractedData = extractBookApiData(apiData);
        const categories = extractCategories(apiData);

        for (const category_str of categories) {
            try {
                const _category = await prisma.bookCategory.create({
                    data: {
                        name: category_str,
                    },
                });
            } catch (_e) {
                // ignore if the category already exists
            }
        }

        await prisma.bookApiData.upsert({
            where: { id: apiData.id },
            create: {
                ...extractedData,
                categories: {
                    connect: categories.map((n) => ({
                        name: n,
                    })),
                },
            },
            update: {
                ...extractedData,
                categories: {
                    set: categories.map((n) => ({ name: n })),
                },
            },
        });
    }
    return apiData;
}
