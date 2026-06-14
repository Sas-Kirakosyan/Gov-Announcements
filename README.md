# Government Announcements Feed

A small single-page web app where residents can browse, search, bookmark, and
read official government announcements. Announcements are sourced from the
[JSONPlaceholder](https://jsonplaceholder.typicode.com) `/posts` API and mapped
into a domain model on the fly.

Built with **React + React Router + TypeScript** and **plain CSS** — no UI
component kits and no data-fetching libraries (just the browser `fetch` API).

---

## Getting started

Requirements: Node 18+.

```bash
npm install
npm start          # starts the Vite dev server (http://localhost:3000, opens automatically)
```

Other scripts:

```bash
npm run build      # type-check and produce a production build in dist/
npm run preview    # serve the production build locally
npm test           # run the unit + component test suite (Vitest)
npm run test:watch # run tests in watch mode
```

> `npm start` is aliased to Vite so the standard `npm install && npm start`
> flow works out of the box.

---

## Features

- **Feed (`/announcements`)** — loads all announcements once, with explicit
  loading, error (+ **Retry**), and empty states. Each item shows its title, a
  colour-coded category badge, and an urgent indicator where applicable.
- **Search + category filter** — real-time, client-side, no extra API calls.
  Both filters apply simultaneously and live in the URL query string.
- **Detail (`/announcements/:id`)** — shows every field. Navigating from the
  feed reuses already-fetched data (no second request); opening the URL
  directly falls back to fetching that single post. Includes a **Back** button
  that restores the feed's previous search/filter state.
- **Bookmarks** — toggle from the feed or detail page, persisted to
  `localStorage`, with a live count badge in the nav bar and a dedicated
  **`/bookmarks`** page.

---

## Architecture decisions

**Single fetch, shared in-memory cache.** `AnnouncementsContext` fetches the
list once on load and exposes it (plus status and a `retry`) to every page.
The Feed renders from it; the Detail page looks the item up by id via an
indexed `Map` (O(1)) and only hits the network — using `GET /posts/:id` — when
the cache is cold (a deep link). This satisfies "don't refetch when navigating
from the feed" without a heavyweight data layer.

**URL is the source of truth for filters.** Search (`?q=`) and category
(`?category=`) live in the query string via `useSearchParams`. This makes the
Back-button requirement fall out naturally: returning from the detail page
restores the exact prior view, and filtered views are shareable/linkable. Card
links carry the current query so `navigate(-1)` lands on the right state.

**React Context over a state library.** The app has two small, well-bounded
pieces of shared state (announcements and bookmarks). Two context providers
cover them with no extra dependencies, keeping within the "React + React Router
only" constraint.

**Bookmarks store the full announcement.** Rather than persisting only ids, the
whole announcement object is saved under one `localStorage` key. The Bookmarks
page therefore renders standalone — even on a cold refresh before the feed has
loaded — and never needs to refetch. All storage access is wrapped in
`try/catch` so disabled or corrupt storage degrades gracefully instead of
crashing.

**One `useFetch` hook for all requests.** The two fetch sites — the
announcements list and the single-post detail fallback — share one custom hook
(`hooks/useFetch.ts`) that owns the abort controller, `loading/success/error`
status, and a `reload()` for retries. This isn't a data-fetching library (still
plain `fetch` under the hood); it just removes duplicated boilerplate. Aborts
are detected via `signal.aborted`, which ignores both a late success and the
AbortError throw, and the hook can be disabled so the detail page skips the
request entirely when the announcement is already cached.

**Pure logic isolated for testing.** Data mapping (`lib/mapping.ts`) and
filtering (`lib/filtering.ts`) are pure functions, kept separate from React so
they're trivial to unit-test and reuse.

**CSS Modules, co-located per component.** Each component/page owns a
`*.module.css` next to it (`AnnouncementCard.module.css`, etc.), so class names
are build-time scoped — no global collisions and no BEM naming discipline. A
single `styles/global.css` holds only the foundation (design tokens as CSS
custom properties, reset, base element styling, `prefers-reduced-motion`), and
`styles/common.module.css` holds the few genuinely cross-cutting primitives
(buttons, page header, card list, async-state blocks). This is still "plain CSS"
— Modules are just scoping at build time, no preprocessor/`sass` dependency — and
because the pages are lazy-loaded, each route's module CSS is bundled into that
route's chunk automatically. At this app's size the chunking is a negligible
performance win; the choice is for scope safety and convention, and to stay
consistent with the lazy-loaded routing.

### Data mapping

| Field      | Source                                                              |
| ---------- | ------------------------------------------------------------------ |
| `id`       | `post.id`                                                          |
| `title`    | `post.title`, with the first letter of each word capitalized        |
| `body`     | `post.body`                                                        |
| `category` | `id % 4` → 0 Health · 1 Transport · 2 Education · else Infrastructure |
| `isUrgent` | `true` when `id % 7 === 0`                                          |

### Project structure

```
src/
  lib/         pure helpers: mapping, filtering, api (fetch), storage
  hooks/       useFetch — shared abort/status/retry logic
  context/     AnnouncementsContext, BookmarksContext
  components/  NavBar, AnnouncementCard, badges, … (each with a co-located *.module.css)
  pages/       FeedPage, DetailPage, BookmarksPage (each with a co-located *.module.css)
  styles/      global.css (tokens/reset/base) + common.module.css (shared primitives)
  test/        Vitest unit + component tests
```

---

## Tests

Run with `npm test`. Coverage focuses on the parts most worth protecting:

- `mapping.test.ts` — capitalization, all four category branches, urgent flag.
- `filtering.test.ts` — search-only, category-only, the two combined,
  case-insensitivity, and no-match.
- `BookmarksContext.test.tsx` — toggle, `localStorage` persistence, rehydration,
  and graceful recovery from corrupt storage.
- `FeedPage.test.tsx` — loading → loaded flow, search + category filtering
  working together (mocked `fetch`), and the error + Retry state.

---

## Known limitations & trade-offs

- **In-memory cache, not persisted.** A hard refresh re-fetches the list. This
  keeps data fresh and the implementation simple; a longer-lived cache wasn't
  warranted for a feed of this size.
- **Mock API.** JSONPlaceholder is read-only sample data, so bookmarking is the
  only state that "sticks" (in `localStorage`). Titles/bodies are lorem ipsum.
- **No pagination/virtualization.** All ~100 posts render at once, which is fine
  at this scale; a much larger feed would want windowing.
- **Category/urgent overlap by design.** Because both are derived from `id`,
  e.g. `id` 28 is both `Health` (28 % 4 = 0) and `Urgent` (28 % 7 = 0). This
  follows the spec literally. (`id 0` isn't returned by the API, so the
  `0 % 7 === 0` edge never appears in practice.)
- **Client-side search only.** As required, search filters the already-fetched
  list; it does not query the server.
