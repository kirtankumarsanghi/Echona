/**
 * Custom hook for debouncing button clicks (#21)
 * Prevents rapid double-clicks on ML analysis buttons
 */
import { useRef, useCallback } from "react";

export function useDebounce(fn, delay = 2000) {
  const timerRef = useRef(null);
  const lastCallRef = useRef(0);

  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastCallRef.current < delay) {
        return; // Too soon, ignore
      }
      lastCallRef.current = now;
      if (timerRef.current) clearTimeout(timerRef.current);
      fn(...args);
    },
    [fn, delay]
  );
}

/**
 * Hook to track loading + prevent double submission
 */
export function useSubmitGuard() {
  const submittingRef = useRef(false);

  const guard = useCallback(async (asyncFn) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      await asyncFn();
    } finally {
      submittingRef.current = false;
    }
  }, []);

  return guard;
}
