/**
 * lib/hooks/use-local-storage.ts
 * Generic localStorage hook with SSR safety and JSON serialisation.
 */
"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Lazy initialiser — reads from localStorage only on first render
  const [stored, setStored] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStored(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`useLocalStorage: could not read "${key}"`, error);
    }
    setHydrated(true);
  }, [key]);

  // Persist to localStorage whenever `stored` changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(stored));
    } catch (error) {
      console.warn(`useLocalStorage: could not write "${key}"`, error);
    }
  }, [key, stored, hydrated]);

  // Setter that mirrors React's useState API
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) =>
        value instanceof Function ? value(prev) : value
      );
    },
    []
  );

  // Clear helper
  const removeValue = useCallback(() => {
    setStored(initialValue);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }, [key, initialValue]);

  return [stored, setValue, removeValue];
}
