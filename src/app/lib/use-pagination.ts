import { useEffect, useMemo, useState } from "react";

export function usePagination<T>(items: T[], pageSize: number, deps: unknown[] = []) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to first page whenever the underlying filtered set changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setPage(1), deps);

  // Clamp if items shrink below current page.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  const from = items.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, items.length);

  return { page, setPage, pageCount, pageItems, from, to, total: items.length };
}
