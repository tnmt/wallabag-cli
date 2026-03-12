import type { Config } from "./config.js";

// ---- Types ----

export interface WallabagTag {
  id: number;
  label: string;
  slug: string;
}

export interface WallabagEntry {
  id: number;
  title: string;
  url: string;
  content: string;
  is_archived: 0 | 1;
  is_starred: 0 | 1;
  created_at: string;
  updated_at: string;
  published_at: string;
  reading_time: number;
  domain_name: string;
  preview_picture: string | null;
  tags: WallabagTag[];
}

export interface WallabagEntriesResponse {
  page: number;
  limit: number;
  pages: number;
  total: number;
  _embedded: {
    items: WallabagEntry[];
  };
}

// ---- Token cache ----

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

let cachedToken: TokenData | null = null;

// ---- Client ----

function baseUrl(config: Config): string {
  return config.url.replace(/\/$/, "");
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function getToken(config: Config): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires_at) {
    return cachedToken.access_token;
  }

  const res = await fetch(`${baseUrl(config)}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "password",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      username: config.username,
      password: config.password,
    }),
  });

  if (!res.ok) {
    throw new Error(`Wallabag token request failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000 - 60_000,
  };

  return cachedToken.access_token;
}

// ---- Entries ----

export interface GetEntriesParams {
  archive?: 0 | 1;
  starred?: 0 | 1;
  page?: number;
  perPage?: number;
}

export async function getEntries(
  config: Config,
  token: string,
  params?: GetEntriesParams
): Promise<WallabagEntriesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.archive !== undefined)
    searchParams.set("archive", String(params.archive));
  if (params?.starred !== undefined)
    searchParams.set("starred", String(params.starred));
  if (params?.page !== undefined)
    searchParams.set("page", String(params.page));
  if (params?.perPage !== undefined)
    searchParams.set("perPage", String(params.perPage));

  const qs = searchParams.toString();
  const res = await fetch(
    `${baseUrl(config)}/api/entries.json${qs ? `?${qs}` : ""}`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) throw new Error(`Wallabag getEntries failed: ${res.status}`);
  return res.json();
}

export async function getEntry(
  config: Config,
  token: string,
  id: number
): Promise<WallabagEntry> {
  const res = await fetch(`${baseUrl(config)}/api/entries/${id}.json`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Wallabag getEntry failed: ${res.status}`);
  return res.json();
}

export async function createEntry(
  config: Config,
  token: string,
  url: string
): Promise<WallabagEntry> {
  const res = await fetch(`${baseUrl(config)}/api/entries.json`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`Wallabag createEntry failed: ${res.status}`);
  return res.json();
}

export interface PatchEntryData {
  archive?: 0 | 1;
  starred?: 0 | 1;
  tags?: string;
}

export async function patchEntry(
  config: Config,
  token: string,
  id: number,
  data: PatchEntryData
): Promise<WallabagEntry> {
  const res = await fetch(`${baseUrl(config)}/api/entries/${id}.json`, {
    method: "PATCH",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Wallabag patchEntry failed: ${res.status}`);
  return res.json();
}

export async function deleteEntry(
  config: Config,
  token: string,
  id: number
): Promise<void> {
  const res = await fetch(`${baseUrl(config)}/api/entries/${id}.json`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Wallabag deleteEntry failed: ${res.status}`);
}

// ---- Tags ----

export async function getTags(
  config: Config,
  token: string
): Promise<WallabagTag[]> {
  const res = await fetch(`${baseUrl(config)}/api/tags.json`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Wallabag getTags failed: ${res.status}`);
  return res.json();
}

export async function addTag(
  config: Config,
  token: string,
  entryId: number,
  tags: string
): Promise<WallabagEntry> {
  const res = await fetch(
    `${baseUrl(config)}/api/entries/${entryId}/tags.json`,
    {
      method: "POST",
      headers: {
        ...authHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags }),
    }
  );
  if (!res.ok) throw new Error(`Wallabag addTag failed: ${res.status}`);
  return res.json();
}

export async function removeTag(
  config: Config,
  token: string,
  entryId: number,
  tagId: number
): Promise<void> {
  const res = await fetch(
    `${baseUrl(config)}/api/entries/${entryId}/tags/${tagId}.json`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    }
  );
  if (!res.ok) throw new Error(`Wallabag removeTag failed: ${res.status}`);
}
