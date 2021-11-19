# SingleStore External Functions + Cloudflare Workers

This is an example of using [CloudFlare Workers][cloudflare-workers] along with [SingleStore External Functions][docs-ef].

SingleStore External Functions is a feature in SingleStore which allows the engine to send and receive rows to an external HTTP service during query execution. Using this feature, we can augment SingleStore's capabilities with new functionality.

**Example use cases:**

* Translating text content between languages using [Amazon Translate][aws-translate]
* Performing sentiment analysis (included in this repository)
* Loading data from an external API (included in this repository)
* Pushing or pulling data to or from an external system
* ...anything else you can put behind an HTTP server 😊

## Setup

1. [Sign up](https://www.singlestore.com/try-free/) for a free SingleStore license. This allows you to run up to 4 nodes up to 32 gigs each for free. Grab your license key from [SingleStore portal](https://portal.singlestore.com/?utm_medium=osm&utm_source=github) and set it as an environment variable.

   ```bash
   export SINGLESTORE_LICENSE="singlestore license"
   ```

2. Setup a SingleStore cluster. You can use the provided `start.sh` script to spin up a cluster using Docker on this machine. **Note: this does not work on M1 Mac machines**.

## Publishing a CloudFlare Worker

This repo is already setup to publish a worker to CloudFlare using their wrangler tool. The following steps should work, however if you run into issues please refer to [CloudFlare's official documentation][cfw-docs].

```bash
yarn install
yarn run wrangler login # only need to run this once per machine
yarn run wrangler publish --name s2-ef-demo index.js
```

If everything works, you should receive a url like `s2-ef-demo.SUBDOMAIN.workers.dev`. The SUBDOMAIN will be specific to your CloudFlare account.

## Creating the external function

To enable external functions you must first connect to your SingleStore cluster and run:

```sql
set global enable_external_functions = ON;
```

> ❗ **Note:** If you are using SingleStore managed service you will need to file a support ticket to enable this feature on your cluster, along with any specific domains you will be accessing (like `*.workers.dev`).

Once external functions are enabled, you can create a database and use them easily. Here is how you would use the sentiment function we deployed to CloudFlare workers:

```sql
create database if not exists demo;
use demo;

CREATE OR REPLACE EXTERNAL FUNCTION sentiment (body TEXT)
RETURNS DOUBLE
AS REMOTE SERVICE "s2-ef-demo.YOUR_WORKER_SUBDOMAIN.workers.dev/sentiment"
FORMAT JSON;

-- change the string here to see the sentiment of different content
select sentiment("i love external functions");

-- lets run it on a table
create table if not exists posts (id int, body text);
insert into posts values (1, "external functions are super cool");
insert into posts values (2, "read the damn docs!");
insert into posts values (3, "I am a huge fan of pineapples");

select body, sentiment(body) from posts;
```

And here is how you would use the coincap assets function we deployed:

```sql
create database if not exists demo;
use demo;

CREATE OR REPLACE EXTERNAL FUNCTION coincap_assets (search TEXT)
RETURNS TABLE(data TEXT)
AS REMOTE SERVICE "s2-ef-demo.YOUR_WORKER_SUBDOMAIN.workers.dev/coincap/assets"
FORMAT JSON;

select * from coincap_assets("BTC");

select
    data::$name,
    format(data::%marketCapUsd, 0),
    format(data::%changePercent24Hr, 2)
from coincap_assets("BTC")
order by data::%changePercent24Hr desc;
```

## Exercises

Now that you have a working endpoint, let's define some more! Modify index.js to add additional endpoints to the router and then re-publish the file to cloudflare workers. Then create a new function for each of your endpoints.

Ideas:
1. Create a function which transforms strings to uppercase
2. Create a function which returns the number of words in a string
3. Create a function which takes multiple arguments
4. Create a function which queries an external API

## Resources

* [Documentation](https://docs.singlestore.com)
* [Twitter](https://twitter.com/SingleStoreDevs)
* [SingleStore Forums](https://www.singlestore.com/forum)


[docs-ef]: https://docs.singlestore.com/db/latest/en/reference/sql-reference/procedural-sql-reference/create--or-replace--external-function.html
[cloudflare-workers]: https://workers.cloudflare.com/
[cfw-docs]: https://developers.cloudflare.com/workers/
[aws-translate]: https://aws.amazon.com/translate/
