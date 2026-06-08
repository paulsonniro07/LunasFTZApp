import { useState, useEffect } from "react";
import type { TaxCalcResult } from "./useTaxCalc";

const STORAGE_KEY = "lunasftz-saved-calcs";

export interface SavedCalc extends TaxCalcResult {
  id: string;
  date: string;
  currency: string;
  exchangeRate: number;
  shipping: number;
  hsCode: string;
  dutyRate: number;
  hasNPWP: boolean;
}

export function useSavedCalcs() {
  const [items, setItems] = useState<SavedCalc[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // corrupted data, ignore
    }
  }, []);

  function save(result: TaxCalcResult, extras: Omit<SavedCalc, keyof TaxCalcResult | "id" | "date">) {
    const newItem: SavedCalc = {
      ...result,
      ...extras,
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function remove(id: string) {
    const updated = items.filter((i: SavedCalc) => i.id !== id);
    setItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function clearAll() {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return { items, save, remove, clearAll };
}