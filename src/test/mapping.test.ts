import { describe, expect, it } from 'vitest';
import {
  capitalizeWords,
  deriveCategory,
  isUrgent,
  mapPostToAnnouncement,
} from '@/lib/mapping';
import type { Post } from '@/types';

describe('capitalizeWords', () => {
  it('capitalizes the first letter of each word', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World');
  });

  it('lowercases the remaining letters of each word', () => {
    expect(capitalizeWords('the QUICK brown FOX')).toBe('The Quick Brown Fox');
  });

  it('preserves multiple spaces between words', () => {
    expect(capitalizeWords('a   b')).toBe('A   B');
  });

  it('handles an empty string', () => {
    expect(capitalizeWords('')).toBe('');
  });
});

describe('deriveCategory', () => {
  it('maps id % 4 === 0 to Health', () => {
    expect(deriveCategory(4)).toBe('Health');
  });

  it('maps id % 4 === 1 to Transport', () => {
    expect(deriveCategory(1)).toBe('Transport');
  });

  it('maps id % 4 === 2 to Education', () => {
    expect(deriveCategory(2)).toBe('Education');
  });

  it('maps anything else to Infrastructure', () => {
    expect(deriveCategory(3)).toBe('Infrastructure');
    expect(deriveCategory(7)).toBe('Infrastructure');
  });
});

describe('isUrgent', () => {
  it('is true for non-zero multiples of 7', () => {
    expect(isUrgent(7)).toBe(true);
    expect(isUrgent(14)).toBe(true);
  });

  it('is false otherwise', () => {
    expect(isUrgent(1)).toBe(false);
    expect(isUrgent(8)).toBe(false);
  });
});

describe('mapPostToAnnouncement', () => {
  it('produces a fully derived announcement', () => {
    const post: Post = {
      id: 7,
      userId: 1,
      title: 'water main REPAIRS scheduled',
      body: 'Details about the repairs.',
    };

    expect(mapPostToAnnouncement(post)).toEqual({
      id: 7,
      title: 'Water Main Repairs Scheduled',
      body: 'Details about the repairs.',
      category: 'Infrastructure', // 7 % 4 === 3
      isUrgent: true, // 7 % 7 === 0
    });
  });
});
