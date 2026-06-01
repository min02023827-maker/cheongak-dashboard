'use client';

import { useState, useEffect, useCallback } from 'react';

const KEY = 'cheongak_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
    setMounted(true);
  }, []);

  const toggle = useCallback((houseManageNo: string) => {
    setFavorites(prev => {
      const next = prev.includes(houseManageNo)
        ? prev.filter(id => id !== houseManageNo)
        : [houseManageNo, ...prev];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isFav = useCallback((houseManageNo: string) => favorites.includes(houseManageNo), [favorites]);

  return { favorites, toggle, isFav, mounted };
}
