# nuqs Filter Migration Design

**Date:** 2026-05-21
**Author:** Jhones

## Goal

Replace the Zustand `useFilterStore` with nuqs URL state so that filter values (`search`, `completion status`, `selected tags`) persist across page refreshes.

Filtering remains purely client-side — nuqs only changes where the state lives (URL instead of memory).

## URL Shape

```
/[board_id]?q=fix+bug&status=completed&tags=tag-id-1,tag-id-2
```

| Param    | Type             | Default | Description                              |
|----------|------------------|---------|------------------------------------------|
| `q`      | string           | `""`    | Search query (debounced from input)      |
| `status` | string enum      | `"all"` | `all` \| `completed` \| `not_completed` |
| `tags`   | string[]         | `[]`    | Array of selected tag UUIDs              |

## Architecture

### New: `hooks/use-filter-params.ts`

Wraps `useQueryStates` from nuqs into a single shared hook. Exposes the same API shape as the old store so consumer diffs are minimal.

```ts
const filterParsers = {
    q:      parseAsString.withDefault(""),
    status: parseAsStringLiteral(["all", "completed", "not_completed"]).withDefault("all"),
    tags:   parseAsArrayOf(parseAsString).withDefault([]),
};

export const useFilterParams = () => {
    const [{ q, status, tags }, setFilters] = useQueryStates(filterParsers, { shallow: true });
    // returns: search_query, completion_filter, selected_tag_ids,
    //          setSearchQuery, setCompletionFilter, toggleTagFilter, clearFilters, is_filters_active
};
```

- `shallow: true` — URL updates via `history.pushState`, no server re-render triggered.
- Setting a param to its default value writes `null` (removes it from the URL) to keep URLs clean.

### Deleted: `store/filter.store.ts`

The Zustand store is removed entirely once all consumers are migrated.

## Files Changed

| File | Change |
|------|--------|
| `hooks/use-filter-params.ts` | **Create** — shared nuqs hook |
| `store/filter.store.ts` | **Delete** |
| `components/columns/filter-bar.tsx` | Replace `useFilterStore` with `useFilterParams`; remove `clearFilters` on `board_id` change useEffect (URL resets naturally on navigation) |
| `hooks/use-filtered-tasks.ts` | Replace `useFilterStore` with `useFilterParams` |
| `components/columns/task-item.tsx` | Replace `useFilterStore` with `useFilterParams` |

## Behavior Notes

- **Search debounce:** `FilterBar` keeps the local state + 300ms debounce pattern, writing the debounced value to `q`. This keeps the URL update rate low while typing.
- **Board navigation reset:** Navigating to a different board changes the URL path, which drops all query params naturally. The `clearFilters` on `board_id` change useEffect is no longer needed and will be removed.
- **Drag-and-drop disable:** `TaskItem` reads `is_filters_active` from `useFilterParams` — behavior is unchanged.
- **`NuqsAdapter`** is already present in `app/layout.tsx` — no provider changes needed.
