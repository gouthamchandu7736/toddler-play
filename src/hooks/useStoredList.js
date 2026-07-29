import { useCallback, useEffect, useState } from "react";

/**
 * A small list persisted to localStorage — used for Favourites and for
 * Recently Played.
 *
 * localStorage, not a server: this app collects nothing and sends nothing.
 * The list never leaves the device, which is why a "favourites" feature can
 * exist here at all without breaking the no-data-collection rule.
 *
 * Every access is wrapped: localStorage throws in private-mode Safari and when
 * a device is out of quota, and a crashed home screen over a bookmark feature
 * would be an absurd trade.
 */
function read(key) {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* full, or blocked — the list simply won't survive a restart */
  }
}

export function useStoredList(key, { max = Infinity } = {}) {
  const [items, setItems] = useState(() => read(key));

  useEffect(() => {
    write(key, items);
  }, [key, items]);

  /** Add to the front, de-duplicated, trimmed to `max`. */
  const push = useCallback(
    (id) => {
      setItems((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, max));
    },
    [max],
  );

  const toggle = useCallback(
    (id) => {
      setItems((prev) =>
        prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [id, ...prev].slice(0, max),
      );
    },
    [max],
  );

  const has = useCallback((id) => items.includes(id), [items]);

  return { items, push, toggle, has };
}

export default useStoredList;
