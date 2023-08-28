import { BOOKS_API_KEY } from "$env/static/private";

export type queriedBook = {
  id: string;
  volumeInfo: {
    title: string;
    subtitle: string;
    authors: string[];
    imageLinks: { smallThumbnail: string; thumbnail: string };
  };
};

export async function queryBooks(query: string): Promise<queriedBook[]> {
  const fields = "items(id, volumeInfo(title, authors, subtitle, imageLinks))";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&projection=lite&fields=${fields}&key=${BOOKS_API_KEY}`;

  const json = await (await fetch(url)).json();
  return json.items;
}

export type queriedBookFull = {
  id: string;
  volumeInfo: {
    title: string;
    subtitle: string;
    authors: string[];
    publishedDate: string;
    publisher: string;
    industryIdentifiers: {
      type: string | undefined;
      identifier: string | undefined;
    }[];
    imageLinks: { smallThumbnail: string; thumbnail: string };
    pageCount: number;
    printedPageCount: number;
    categories: string[] | undefined;
    language: string;
  };
};

export async function getBookApiData(
  volumeId: string,
): Promise<queriedBookFull> {
  const fields =
    "id, volumeInfo(title, subtitle, authors, publishedDate, publisher, industryIdentifiers, imageLinks(smallThumbnail, thumbnail), pageCount, printedPageCount, categories, language)";
  const url = `https://www.googleapis.com/books/v1/volumes/${volumeId}?fields=${fields}&key=${BOOKS_API_KEY}`;

  return (await fetch(url)).json();
}
