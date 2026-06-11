import type { Announcement, Category, Post } from '@/types';

/**
 * Capitalize the first letter of each whitespace-separated word, lowercasing
 * the rest. Preserves the original spacing between words.
 *
 * "the QUICK brown" -> "The Quick Brown"
 */
export function capitalizeWords(input: string): string {
  return input.replace(/\S+/g, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}

/**
 * Derive a category from a post id:
 *   id % 4 === 0 -> Health
 *   id % 4 === 1 -> Transport
 *   id % 4 === 2 -> Education
 *   otherwise    -> Infrastructure
 */
export function deriveCategory(id: number): Category {
  switch (id % 4) {
    case 0:
      return 'Health';
    case 1:
      return 'Transport';
    case 2:
      return 'Education';
    default:
      return 'Infrastructure';
  }
}

/** An announcement is urgent when its id is a non-zero multiple of 7. */
export function isUrgent(id: number): boolean {
  return id % 7 === 0;
}

/** Map a raw API post into the {@link Announcement} domain model. */
export function mapPostToAnnouncement(post: Post): Announcement {
  return {
    id: post.id,
    title: capitalizeWords(post.title),
    body: post.body,
    category: deriveCategory(post.id),
    isUrgent: isUrgent(post.id),
  };
}
