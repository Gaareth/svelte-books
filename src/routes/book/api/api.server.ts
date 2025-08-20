import {
  QUERIED_BOOK_FULL_FIELDS,
  type queriedBook,
  type queriedBookFull,
} from "$appTypes";
import { BOOKS_API_KEY } from "$env/static/private";

export async function queryBooksFull(
  query: string
): Promise<queriedBookFull[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&projection=FULL&fields=${QUERIED_BOOK_FULL_FIELDS}&orderBy=relevance&key=${BOOKS_API_KEY}`;

  const json = await (await fetch(url)).json();
  if (json.items !== undefined) {
    return json.items;
  } else {
    return json;
  }
}

export async function queryBooks(query: string): Promise<queriedBook[]> {
  const fields = "items(id, volumeInfo(title, authors, subtitle, imageLinks))";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&projection=lite&fields=${fields}&orderBy=relevance&key=${BOOKS_API_KEY}`;

  console.log(url);

  const json = await (await fetch(url)).json();
  console.log(json);
  if (json.error !== undefined) {
    return json;
  }
  return json.items;
}

export async function getBookApiData(
  volumeId: string
): Promise<queriedBookFull> {
  const url = `https://www.googleapis.com/books/v1/volumes/${volumeId}?fields=${QUERIED_BOOK_FULL_FIELDS}&key=${BOOKS_API_KEY}`;

  return (await fetch(url)).json();
}
