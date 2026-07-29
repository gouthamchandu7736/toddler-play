import { useEffect } from "react";

/**
 * Locks the page down so it behaves like a kiosk, not a web page.
 *
 * Blocks: pinch-zoom, double-tap-zoom, pull-to-refresh, overscroll bounce,
 * long-press context menu, text selection, and ctrl+wheel desktop zoom.
 *
 * The CSS in global.css covers the declarative half (touch-action,
 * overscroll-behavior, user-select). This hook covers the cases browsers
 * only respect from a non-passive listener.
 *
 * Call once, at the app root.
 */
export function useNoGestures() {
  useEffect(() => {
    // Listeners that call preventDefault on touch events must be non-passive,
    // otherwise Chrome ignores the preventDefault and logs a warning.
    const nonPassive = { passive: false };

    // Nothing in this app scrolls or drags, so every touchmove is either an
    // accidental swipe, a pinch, or a pull-to-refresh. Cancel them all.
    const onTouchMove = (e) => {
      if (e.cancelable) e.preventDefault();
    };

    // iOS Safari fires these for pinch even when touch-action is set.
    const onGesture = (e) => {
      if (e.cancelable) e.preventDefault();
    };

    // Fallback double-tap-zoom guard for engines that ignore touch-action.
    const onDoubleClick = (e) => {
      if (e.cancelable) e.preventDefault();
    };

    const onContextMenu = (e) => {
      e.preventDefault();
    };

    const onSelectStart = (e) => {
      e.preventDefault();
    };

    // Desktop pinch-zoom on trackpads arrives as ctrl+wheel.
    const onWheel = (e) => {
      if (e.ctrlKey && e.cancelable) e.preventDefault();
    };

    // Ctrl/Cmd +, -, 0 zoom — mostly a dev-machine concern, cheap to block.
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].includes(e.key)) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", onTouchMove, nonPassive);
    document.addEventListener("gesturestart", onGesture, nonPassive);
    document.addEventListener("gesturechange", onGesture, nonPassive);
    document.addEventListener("gestureend", onGesture, nonPassive);
    document.addEventListener("dblclick", onDoubleClick, nonPassive);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("wheel", onWheel, nonPassive);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("touchmove", onTouchMove, nonPassive);
      document.removeEventListener("gesturestart", onGesture, nonPassive);
      document.removeEventListener("gesturechange", onGesture, nonPassive);
      document.removeEventListener("gestureend", onGesture, nonPassive);
      document.removeEventListener("dblclick", onDoubleClick, nonPassive);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("wheel", onWheel, nonPassive);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}

export default useNoGestures;
