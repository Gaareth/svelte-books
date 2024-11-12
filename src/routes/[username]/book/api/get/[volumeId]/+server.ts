import { type RequestHandler, error, json } from "@sveltejs/kit";
import { getBookApiData } from "../../api.server";

export const GET: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession();
  if (!session) {
    error(401);
  }
  const volumeId = params.volumeId;
  if (volumeId === null || volumeId === undefined) {
    error(400);
  }

  const data = await getBookApiData(volumeId);
  // console.log(data);

  return json(data);
};
