import { error, json, type RequestHandler } from "@sveltejs/kit";
import { queryBooks } from "../api.server";

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = await locals.getSession();
  if (!session) {
    throw error(401);
  }

  const query = url.searchParams.get("query");
  if (query === null) {
    throw error(400);
  }

  const data = await queryBooks(query);
  // console.log(data);

  return json(data);
};
