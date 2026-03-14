import "dotenv/config";
import { readFile, writeFile } from "fs/promises";

// prettier-ignore
const COMMON_WORDS = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her",
    "she", "or", "an", "will", "my", "one", "all", "would", "there",
    "their", "what", "so", "up", "out", "if", "about", "who", "get",
    "which", "go", "me", "when", "make", "can", "like", "time", "no",
    "just", "him", "know", "take", "people", "into", "year", "your",
    "good", "some", "could", "them", "see", "other", "than", "then",
    "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first",
    "well", "way", "even", "new", "want", "because", "any", "these",
    "give", "day", "most", "us", // from https://en.wikipedia.org/wiki/Most_common_words_in_English
    // ... more common words

    "shadow", "dragon", "dragon", "night", "dead", "city", "dark", 
    "blood", "magic", "world", "fire", "dream", "wolf", "black", "King",
    "queen", "lord", "book", "light", "moon", "time", "last", 
    "god", "star", "storm", "heart", "demon", "red", "blue", "hunt", 
    "knight", "gate", "man", "gold", "sword",

    "love", "world", "girl", "house", "woman", "last", "life", "one", "death"
]

const COMMON_CATEGORIES = [
  "fiction",
  "general",
  "science fiction",
  "fantasy",
  "mystery",
  "thriller",
  "romance",
  "historical",
  "biography",
  "self-help",
  "health",
  "travel",
  "young adult",
  "comics",
  "graphic novels",
  "poetry",
  "religion",
  "spirituality",
  "science",
  "technology",
  "business",
  "economics",
  "philosophy",
  "psychology",
  "sociology",
  "politics",
  // ... more common categories
];

const BOOKS_API_KEY = process.env.BOOKS_API_KEY;

if (!BOOKS_API_KEY) {
  throw new Error("Missing BOOKS_API_KEY environment variable");
}

export type queriedBookWithCategories = {
  id: string;
  volumeInfo: {
    categories: string[] | undefined | string;
  };
};

export async function queryBooksGeneric<T>(
  query: string,
  fields: string,
  params?: Record<string, string>
): Promise<T> {
  let url = `https://www.googleapis.com/books/v1/volumes?q=${query}&fields=${fields}&orderBy=relevance&key=${BOOKS_API_KEY}`;

  for (const [key, value] of Object.entries(params || {})) {
    url += `&${key}=${value}`;
  }

  const json = await (await fetch(url)).json();

  if (json.error !== undefined) {
    throw new Error(json.error.message);
  }
  return json.items;
}

export async function getAllCategories<T>(id: string): Promise<T> {
  const fields = "id, volumeInfo(categories)";
  let url = `https://www.googleapis.com/books/v1/volumes/${id}?fields=${fields}&key=${BOOKS_API_KEY}`;
  const json = await (await fetch(url)).json();

  if (json.error !== undefined) {
    throw new Error(json.error.message);
  }
  return json.volumeInfo?.categories;
}

const CURRENT_USAGE = 0;
const REQUEST_PER_DAY = 1000 - CURRENT_USAGE; // Google Books API free tier limit
const REQUESTS_PER_SECOND = 100 / 60; // 100 requests per minute
const DELAY_MS = 1000 / REQUESTS_PER_SECOND;

const maxResults = 40;

// TODO: search for categories of top popular books

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchForCategories(): Promise<string[]> {
  const fields = "items(id, volumeInfo(categories))";

  // Initialize sets for unique search words and categories
  const uniqueWords = new Set(COMMON_WORDS);
  const categoriesSet = new Set(COMMON_CATEGORIES);
  const booksDone = new Set<string>();

  let totalRequests = 0;

  // Add categories to the set
  function addCategories(categories: string[] | string) {
    if (Array.isArray(categories)) {
      for (const category of categories) {
        categoriesSet.add(category);
      }
    } else {
      categoriesSet.add(categories);
    }
  }

  // Process a single book: volumeInfo + getAllCategories
  async function processBook(book: queriedBookWithCategories) {
    if (booksDone.has(book.id)) {
      return;
    }
    booksDone.add(book.id);

    // main category. book mostly has only one category
    if (book.volumeInfo?.categories) {
      addCategories(book.volumeInfo.categories);
    } else {
      console.log(`Book ${book.id} has no categories, skipping volumeInfo.`);
    }

    // these are often in BISAC format (includes "/")
    const allCategories: string[] | undefined = await getAllCategories(book.id);
    if (allCategories) {
      addCategories(allCategories);
    } else {
      console.log(`Book ${book.id} has no categories from getAllCategories.`);
    }

    await sleep(DELAY_MS); // RPS throttling
    totalRequests++;
  }

  // Process all books for a single search word
  async function processWord(word: string) {
    const books = await queryBooksGeneric<queriedBookWithCategories[]>(
      word,
      fields,
      {
        maxResults: maxResults.toString(),
      }
    );

    totalRequests++;
    await sleep(DELAY_MS); // throttle queryBooksGeneric call

    if (!books) return;

    for (const book of books) {
      await processBook(book);
    }
  }

  // Main loop: process all words sequentially
  let wordCount = 0;
  for (const word of uniqueWords) {
    try {
      console.log(
        `Progress: ${wordCount}/${uniqueWords.size} ${Math.round(
          (wordCount / uniqueWords.size) * 100
        )}%`
      );
      await processWord(word);
      wordCount++;

      console.log(
        `Total requests: ${totalRequests}. Total unique categories: ${categoriesSet.size}. Total books processed: ${booksDone.size}.`
      );

      if (totalRequests >= REQUEST_PER_DAY) {
        console.warn(
          `Reached daily request limit of ${REQUEST_PER_DAY}. Stopping further requests.`
        );
        break;
      }
    } catch (err) {
      console.error(`Error processing word "${word}":`, err);
    }
  }

  return Array.from(categoriesSet);
}

export async function exportCategories(categories: string[]) {
  try {
    await writeFile(
      "src/categoryToColor/categories.json",
      JSON.stringify(categories)
    );
  } catch (err) {
    console.error("Error writing categories to file:", err);
  }
}

export async function loadOrCreateCategories(): Promise<string[]> {
  try {
    const data = await readFile("src/categoryToColor/categories.json", "utf-8");
    const categories = JSON.parse(data);
    console.log(`Loaded ${categories.length} categories from file.`);
    return categories;
  } catch (err) {
    console.warn("Could not load categories from file, fetching from API...");
    const categories = await searchForCategories();
    console.log(`Fetched ${categories.length} categories from API.`);
    await exportCategories(categories);
    return categories;
  }
}

export async function loadBisacCategories(): Promise<string[]> {
  try {
    const data = await readFile(
      "src/categoryToColor/bisacCategories.json",
      "utf-8"
    );
    const categories = JSON.parse(data);
    console.log(`Loaded ${categories.length} BISAC categories from file.`);
    return categories;
  } catch (err) {
    throw new Error("Could not load BISAC categories from file.");
  }
}
