import { Router } from "itty-router";
import Sentiment from "sentiment";

const router = Router();
const sentiment = new Sentiment();

router.post("/sentiment", async (request) => {
  // load the request body as JSON
  const body = await request.json();

  /* SingleStore passes data as a nested array of rows like so:
  {
    "data": [
      [ROWID, COLUMN_1, COLUMN_2, ...],
      [ROWID, COLUMN_1, COLUMN_2, ...],
      ...
    ]
  }
  */

  // in this case, we expect SingleStore to just send us one string per row
  // which is the content to perform sentiment analysis on
  const out = body.data.map(([rowid, content]) => {
    const result = sentiment.analyze(content);
    return [rowid, result.score];
  });

  // SingleStore expects the same data structure back as what it sent us
  return new Response(JSON.stringify({ data: out }), {
    headers: { "content-type": "application/json" },
  });
});

const coincapAssets = (search) =>
  fetch(
    "https://api.coincap.io/v2/assets?limit=5&search=" +
      encodeURIComponent(search),
    {
      headers: {
        Accept: "application/json",

        // update this with your coincap api key to increase rate limits
        // Authorization: "Bearer XXX",
      },
    }
  ).then((r) => r.json());

router.post("/coincap/assets", async (request) => {
  const body = await request.json();
  let out = [];

  for (let i = 0; i < body.data.length; i++) {
    let [rowid, search] = body.data[i];
    let result = await coincapAssets(search);
    for (let j = 0; j < result.data.length; j++) {
      out.push([rowid, JSON.stringify(result.data[j])]);
    }
  }

  return new Response(JSON.stringify({ data: out }), {
    headers: { "content-type": "application/json" },
  });
});

router.get(
  "/",
  () => new Response("Welcome to the SingleStore External Functions Demo!")
);

router.get("*", () => new Response("not found", { status: 404 }));

const handleError = (error) =>
  new Response(error.message || "server error", {
    status: error.status || 500,
  });

addEventListener("fetch", (event) => {
  event.respondWith(router.handle(event.request).catch(handleError));
});
