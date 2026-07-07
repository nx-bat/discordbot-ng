import { existsSync, readFileSync } from 'fs';
import { config } from '../config';
import _https from 'https';
import _http from 'http';
import { E621Pool, E621Post, E621User, PostFlag, Record } from '../types';
import path from 'path';

const secure = config.E621_BASE_URL?.startsWith('https');
const http = secure ? _https : _http;

const BLACKLISTED_TAGS: string[] = [];
const BLACKLISTED_NONSAFE_TAGS: string[] = ['young'];

const SPOILERED_TAGS: string[] = ['gore', 'feces', 'watersports'];
const SPOILERED_NONSAFE_TAGS: string[] = [];

const USER_AGENT = 'E621DiscordBot';

export const SEARCH_LIMIT = 320;

let agent: _https.Agent | _http.Agent = secure ? new _https.Agent() : new _http.Agent();
if (secure && existsSync('./certs/cert.pem') && existsSync('./certs/cert.pem')) {
  console.log('[E621 Requester] Initializing agent with certificates.');
  agent = new _https.Agent({
    cert: readFileSync(path.join(__dirname, '..', '..', 'certs', 'cert.pem'), { encoding: 'utf8' }),
    key: readFileSync(path.join(__dirname, '..', '..', 'certs', 'priv.key'), { encoding: 'utf8' }),
    rejectUnauthorized: false
  });
}

async function request(path: string, query?: { [name: string]: string }): Promise<any> {
  const url = new URL(config.E621_BASE_URL!);
  url.pathname = path + '.json';

  if (query) {
    for (const [name, value] of Object.entries(query)) {
      url.searchParams.set(name, value);
    }
  }

  return new Promise((resolve) => {
    http.get(url, {
      agent,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      }
    }, (res) => {
      if (res.statusCode! < 200 || res.statusCode! >= 300) {
        console.error(`[E621 Requester] Received status code ${res.statusCode} while requesting: ${url}`);
        res.resume();
        return resolve(null);
      }

      res.setEncoding('utf8');

      let data = '';

      res.on('data', (d) => {
        data += d;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.error('[E621 Requester] Error parsing JSON from:');
          console.error(data);
          resolve(null);
        }
      });
    }).on('error', (e) => {
      console.error('[E621 Requester] Error fetching:');
      console.error(e);
      resolve(null);
    });
  });
}

export async function getE621User(idOrName: string | number): Promise<E621User | null> {
  return await request(`/users/${idOrName}`) as E621User;
}

export async function getE621Post(id: string | number): Promise<E621Post | null> {
  return (await request(`/posts/${id}`, { v2: 'true' })) as E621Post ?? null;
}

export async function getManyE621Posts(ids: string[] | number[]): Promise<E621Post[]> {
  return (await request('/posts', { v2: 'true', tags: `id:${ids.join(',')}` })) as E621Post[] ?? [];
}

export async function getE621PostByMd5(md5: string): Promise<E621Post | null> {
  return (await request('/posts', { md5, v2: 'true' })) as E621Post ?? null;
}

export async function getE621PostFlag(id: number): Promise<PostFlag | null> {
  return await request(`/post_flags/${id}`) as PostFlag ?? null;
}

export async function getE621Pool(id: string | number): Promise<E621Pool | null> {
  return (await request(`/pools/${id}`)) as E621Pool ?? null;
}

export const enum PostAction {
  NoAction = 0,
  Spoiler = 1,
  Blacklist = 2
}

export function spoilerOrBlacklist(post: E621Post): { action: PostAction, tag: string } {
  const tags = Object.values(post.tags).flat();

  for (const tag of tags) {
    if (BLACKLISTED_TAGS.includes(tag)) return { action: PostAction.Blacklist, tag };
    if (post.rating != 's' && BLACKLISTED_NONSAFE_TAGS.includes(tag)) return { action: PostAction.Blacklist, tag };
  }

  for (const tag of tags) {
    if (SPOILERED_TAGS.includes(tag)) return { action: PostAction.Spoiler, tag };
    if (post.rating != 's' && SPOILERED_NONSAFE_TAGS.includes(tag)) return { action: PostAction.Spoiler, tag };
  }

  return { action: PostAction.NoAction, tag: '' };
}

export function getPostUrl(post: E621Post): string {
  if (post.rating == 's') return `${config.E926_BASE_URL}/posts/${post.id}`;
  return `${config.E621_BASE_URL}/posts/${post.id}`;
}

export function getPoolUrl(pool: E621Pool): string {
  return `${config.E621_BASE_URL}/pools/${pool.id}`;
}

export async function userIsBanned(idOrName: string | number): Promise<boolean> {
  const user = await getE621User(idOrName);
  return user?.is_banned ?? false;
}

export async function getUserRecords(id: number): Promise<Record[]> {
  const records = await request('/user_feedbacks', { 'search[user_id]': id.toString() });

  if (records.user_feedbacks) return [];

  return records as Record[];
}