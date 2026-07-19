# Turning on shared cloud sync

By default the planner saves to whatever browser you're using. To make it a
**living document that syncs automatically between you and Danielle**, connect
it to a free Supabase database. It takes about five minutes and needs no credit
card. You only do this once.

## What you get

- Every change saves to the cloud automatically — no export/import.
- Both phones (and any computer) share one plan and stay in sync within a few
  seconds.
- No accounts or passwords. Access is controlled by a secret token baked into
  your private share link — only people you send the link to can see the plan.

---

## Step 1 — Create a free Supabase project

1. Go to **https://supabase.com** and sign up (GitHub or email — it's free).
2. Click **New project**. Give it any name (e.g. `wedding`), set a database
   password (you won't need it again — just save it somewhere), pick the region
   closest to you, and create it. Wait ~2 minutes for it to finish setting up.

## Step 2 — Create the database table and functions

1. In your project, open the **SQL Editor** (left sidebar) → **New query**.
2. Paste the entire block below and click **Run**. It creates one table and
   locks it down so the plan is only reachable with the secret from your link.

```sql
-- One row per shared plan, gated by a secret token.
create table if not exists public.spaces (
  id         text primary key,
  secret     text not null,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Lock the table: no direct access. Everything goes through the two
-- functions below, which require the secret carried in your private link.
alter table public.spaces enable row level security;

create or replace function public.get_space(p_id text, p_secret text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object('data', data, 'updated_at', updated_at)
  from public.spaces
  where id = p_id and secret = p_secret;
$$;

create or replace function public.save_space(p_id text, p_secret text, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.spaces (id, secret, data, updated_at)
  values (p_id, p_secret, p_data, now())
  on conflict (id) do update
    set data = excluded.data, updated_at = now()
    where public.spaces.secret = p_secret;
end;
$$;

-- Let the app's public "anon" key call only these two functions.
revoke all on function public.get_space(text, text)      from public;
revoke all on function public.save_space(text, text, jsonb) from public;
grant execute on function public.get_space(text, text)      to anon;
grant execute on function public.save_space(text, text, jsonb) to anon;
```

## Step 3 — Copy your two connection values

1. Open **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** (looks like `https://abcd1234.supabase.co`).
3. Copy the **anon public** key (a long string, under "Project API keys").

Send those two values to me and I'll plug them in and publish — or paste them
into `src/lib/config.js` yourself:

```js
export const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co'
export const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY'
```

That's it. Once those are set and the app is rebuilt, the **Details** tab shows
your shared plan link with a **Copy link** button — send that to Danielle and
you're both editing the same living plan.

---

### Is the anon key safe to publish?

Yes. The anon key is designed to live in browser apps. It can't read or write
anything on its own — the table has row-level security on, and the only way in
is through the two functions above, which demand the secret token from your
private link. Guard the *link*, not the key.
