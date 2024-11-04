import { error, json, type RequestHandler } from "@sveltejs/kit";
import { queryBooks } from "../api.server";

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = await locals.getSession();
  if (!session) {
    error(401);
  }

  const query = url.searchParams.get("query");
  if (query === null) {
    error(400);
  }

  const data = await queryBooks(query);
  console.log(data);

  if (Object.hasOwn(json, "error")) {
    // return new Promise((resolve, reject) => {
    //     reject(new Error(json.error.message))
    // });
    error(0, "arsch");
  }

  return json(data);
};
