import { useEffect, useRef } from "react";

/**
 * Keeps the screen awake while the app is in the foreground.
 *
 * A toddler watching an animation without touching for 30 seconds should not
 * be dropped onto a lock screen.
 *
 * The lock is released by the browser whenever the tab is hidden, so it has to
 * be re-acquired on visibilitychange. Unsupported browsers (all of iOS before
 * 16.4, Firefox) simply do nothing — this fails silently by design.
 */
export function useWakeLock(active = true) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    if (typeof navigator === "undefined" || !navigator.wakeLock) return undefined;

    let cancelled = false;

    const acquire = async () => {
      // Requesting while hidden always rejects; skip rather than log noise.
      if (document.visibilityState !== "visible") return;
      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) {
          sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        sentinel.addEventListener("release", () => {
          sentinelRef.current = null;
        });
      } catch {
        /* not permitted / not supported — play continues without it */
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !sentinelRef.current) {
        acquire();
      }
    };

    acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (sentinelRef.current) {
        sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
      }
    };
  }, [active]);
}

export default useWakeLock;
