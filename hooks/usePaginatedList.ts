import type { Page } from "@/types/api";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Infinite list over a Spring `Page` endpoint. Pass a memoized `fetchPage`;
 * whenever it changes (e.g. a new filter) the list restarts from page 0.
 */
export function usePaginatedList<T extends { id: number }>(fetchPage: (page: number) => Promise<Page<T>>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Ignores responses from requests that were superseded by a newer reload.
  const requestId = useRef(0);
  const loadingRef = useRef(false);

  const load = useCallback(
    async (pageToLoad: number, mode: "reset" | "more" | "refresh") => {
      const id = ++requestId.current;
      loadingRef.current = true;
      if (mode === "refresh") setRefreshing(true);
      else setLoading(true);

      try {
        const response = await fetchPage(pageToLoad);
        if (id !== requestId.current) return;

        setItems((old) => {
          if (pageToLoad === 0) return response.content;
          const byId = new Map(old.map((item) => [item.id, item]));
          response.content.forEach((item) => byId.set(item.id, item));
          return [...byId.values()];
        });
        setPage(pageToLoad);
        setHasMore(!response.last);
        setError(null);
      } catch (e: any) {
        if (id === requestId.current) setError(e?.message || "Não foi possível carregar os dados.");
      } finally {
        if (id === requestId.current) {
          loadingRef.current = false;
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [fetchPage],
  );

  useEffect(() => {
    setItems([]);
    setHasMore(true);
    load(0, "reset");
  }, [load]);

  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore) load(page + 1, "more");
  }, [load, hasMore, page]);

  const refresh = useCallback(() => load(0, "refresh"), [load]);
  const reload = useCallback(() => load(0, "reset"), [load]);

  return { items, loading, refreshing, error, hasMore, loadMore, refresh, reload };
}
