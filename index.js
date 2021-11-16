var Sentiment = require("sentiment");

var sentiment = new Sentiment();

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  switch (url.pathname) {
    case "/ping":
      return handlePing(request, url);
    case "/sentiment":
      return handleSentiment(request, url);
  }

  return new Response("not found", {
    status: 404,
  });
}

async function handlePing(request, url) {
  return new Response(`pong: ${url}`, {
    headers: { "content-type": "text/plain" },
  });
}

async function handleSentiment(request, url) {
  const body = await request.json();
  const out = body.data.map(([rowid, content]) => {
    let result = sentiment.analyze(content);
    return [rowid, result.score];
  });
  return new Response(JSON.stringify({ data: out }), {
    headers: { "content-type": "application/json" },
  });
}
