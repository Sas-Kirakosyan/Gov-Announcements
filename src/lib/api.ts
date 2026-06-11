import type { Announcement, Post } from '@/types';
import { mapPostToAnnouncement } from '@/lib/mapping';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

/** Thrown when the API responds with a non-OK HTTP status. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Thrown when a requested announcement does not exist (HTTP 404). */
export class NotFoundError extends ApiError {
  constructor(id: number) {
    super(`Announcement #${id} was not found.`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Fetch every announcement. Used once on app load to populate the in-memory
 * cache that every page reads from.
 */
export async function fetchAnnouncements(
  signal?: AbortSignal,
): Promise<Announcement[]> {
  const res = await fetch(`${BASE_URL}/posts`, { signal });
  if (!res.ok) {
    throw new ApiError(
      `Failed to load announcements (HTTP ${res.status}).`,
      res.status,
    );
  }
  const posts = (await res.json()) as Post[];
  return posts.map(mapPostToAnnouncement);
}

/**
 * Fetch a single announcement by id. Only used as a fallback when the Detail
 * page is opened directly (deep link) and the cache is empty.
 */
export async function fetchAnnouncement(
  id: number,
  signal?: AbortSignal,
): Promise<Announcement> {
  const res = await fetch(`${BASE_URL}/posts/${id}`, { signal });
  if (res.status === 404) {
    throw new NotFoundError(id);
  }
  if (!res.ok) {
    throw new ApiError(
      `Failed to load announcement #${id} (HTTP ${res.status}).`,
      res.status,
    );
  }
  const post = (await res.json()) as Post;
  return mapPostToAnnouncement(post);
}
