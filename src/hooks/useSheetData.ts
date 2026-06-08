import { useState, useEffect, useRef } from "react";

const FALLBACK_RATES: Record<string, number> = {
  USD: 16500,
  RMB: 2300,
  SGD: 12500,
};

interface HSCodeEntry {
  code: string;
  kategori: string;
  tarifBM: number;
}

interface SheetData {
  exchangeRates: Record<string, number>;
  hsCodes: HSCodeEntry[];
  isLoaded: boolean;
  fetchTimestamp: Date | null;
}

// In-memory cache
let cachedData: SheetData | null = null;
let cachePromise: Promise<SheetData> | null = null;

function parseGvizJson(raw: string): unknown {
  // Strip /*O_o*/ prefix and )]}'  wrapper
  let json = raw.trim();
  if (json.startsWith("/*O_o*/")) {
    json = json.slice(7);
  }
  // Remove trailing )]}'  if present
  if (json.endsWith(")]}'")) {
    json = json.slice(0, -5);
  }
  // Find the actual JSON object
  const start = json.indexOf("{");
  const end = json.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Could not find JSON object in GViz response");
  }
  json = json.slice(start, end + 1);
  return JSON.parse(json);
}

function extractTableRows(data: unknown): unknown[][] {
  const table = (data as Record<string, unknown>)?.table as Record<string, unknown> | undefined;
  if (!table?.rows) return [];
  return (table.rows as Array<{ c: unknown[] }>).map((row) =>
    row.c.map((col: unknown) => {
      if (col && typeof col === "object" && "v" in (col as Record<string, unknown>)) {
        return (col as Record<string, unknown>).v;
      }
      return null;
    })
  );
}

async function fetchSheet(
  sheetId: string,
  sheetName: string
): Promise<unknown> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${sheetName}`);
  }
  const text = await res.text();
  return parseGvizJson(text);
}

async function loadSheetData(sheetId: string): Promise<SheetData> {
  try {
    const [ratesData, hsData] = await Promise.all([
      fetchSheet(sheetId, "ExchangeRates"),
      fetchSheet(sheetId, "HSCodes"),
    ]);

    const ratesRows = extractTableRows(ratesData);
    const hsRows = extractTableRows(hsData);

    const exchangeRates: Record<string, number> = {};
    for (const row of ratesRows) {
      const currency = String(row[0] ?? "").trim();
      const rate = Number(row[1]);
      if (currency && !isNaN(rate) && rate > 0) {
        exchangeRates[currency] = rate;
      }
    }

    const hsCodes: HSCodeEntry[] = [];
    for (const row of hsRows) {
      const code = String(row[0] ?? "").trim();
      const kategori = String(row[1] ?? "").trim();
      const tarifBM = Number(row[2]);
      if (code && !isNaN(tarifBM)) {
        hsCodes.push({ code, kategori, tarifBM });
      }
    }

    return {
      exchangeRates: Object.keys(exchangeRates).length > 0 ? exchangeRates : FALLBACK_RATES,
      hsCodes,
      isLoaded: true,
      fetchTimestamp: new Date(),
    };
  } catch {
    // Silently fall back to hardcoded defaults
    return {
      exchangeRates: { ...FALLBACK_RATES },
      hsCodes: [],
      isLoaded: false,
      fetchTimestamp: null,
    };
  }
}

export function useSheetData(): SheetData {
  const [data, setData] = useState<SheetData>(() => {
    if (cachedData) return cachedData;
    return {
      exchangeRates: { ...FALLBACK_RATES },
      hsCodes: [],
      isLoaded: false,
      fetchTimestamp: null,
    };
  });
  const fetchAttempted = useRef(false);

  useEffect(() => {
    if (fetchAttempted.current) return;
    fetchAttempted.current = true;

    const sheetId = import.meta.env.VITE_SHEET_ID;

    if (!sheetId) {
      // No sheet ID configured, use fallback silently
      setData({
        exchangeRates: { ...FALLBACK_RATES },
        hsCodes: [],
        isLoaded: false,
        fetchTimestamp: null,
      });
      return;
    }

    if (cachedData) {
      setData(cachedData);
      return;
    }

    if (!cachePromise) {
      cachePromise = loadSheetData(sheetId);
    }

    cachePromise.then((result) => {
      cachedData = result;
      setData(result);
    });
  }, []);

  return data;
}