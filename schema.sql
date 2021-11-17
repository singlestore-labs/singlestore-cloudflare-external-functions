create database if not exists cloudflare;
use cloudflare;

set global enable_external_functions = ON;

CREATE OR REPLACE EXTERNAL FUNCTION sentiment (body TEXT)
RETURNS DOUBLE
AS REMOTE SERVICE "s2-sentiment.c83.workers.dev/sentiment"
FORMAT JSON;

select sentiment("i love external functions");

create table if not exists posts (id int, body text);
insert into posts values (1, "external functions are super cool");
insert into posts values (2, "read the damn docs!");
insert into posts values (3, "I am a huge fan of pineapples");

select body, sentiment(body) from posts;

insert into posts select * from posts;

select count(*) from posts;
