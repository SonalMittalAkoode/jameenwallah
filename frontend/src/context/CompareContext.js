'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const CompareContext = createContext(null);

const MAX = 3;
const LS_KEY = 'jw_compare_list';

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]);
  const [error, setError] = useState(null);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setCompareList(JSON.parse(saved));
    } catch (_) {}
  }, []);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(compareList));
    } catch (_) {}
  }, [compareList]);

  // Auto-clear error after 3 s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(t);
  }, [error]);

  const isInCompare = useCallback(
    (id) => compareList.some((p) => p.id === id),
    [compareList]
  );

  const addToCompare = useCallback(
    (property) => {
      if (isInCompare(property.id)) return;
      if (compareList.length >= MAX) {
        setError(`You can compare up to ${MAX} properties at a time.`);
        return;
      }
      setCompareList((prev) => [...prev, property]);
    },
    [compareList, isInCompare]
  );

  const removeFromCompare = useCallback((id) => {
    setCompareList((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearCompare = useCallback(() => setCompareList([]), []);

  return (
    <CompareContext.Provider
      value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare, error }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider');
  return ctx;
}
