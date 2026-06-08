import { useState } from "react";
import Calculator from "./components/Calculator";
import SavedList from "./components/SavedList";
import { useSavedCalcs, type SavedCalc } from "./hooks/useSavedCalcs";
import { useSheetData } from "./hooks/useSheetData";
import type { TaxCalcResult } from "./hooks/useTaxCalc";

export default function App() {
  const { items, save, remove, clearAll } = useSavedCalcs();
  const sheet = useSheetData();
  const [tab, setTab] = useState<"hitung" | "riwayat">("hitung");

  const handleSave = (
    result: TaxCalcResult,
    extras: Omit<SavedCalc, keyof TaxCalcResult | "id" | "date">
  ) => {
    save(result, extras);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-green-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-sm font-bold text-white">
              L
            </div>
            <h1 className="text-xl font-bold text-green-700">LunasFTZ</h1>
            {sheet.isLoaded && sheet.fetchTimestamp && (
              <span className="ml-2 text-[10px] text-green-500">
                Kurs diperbarui {sheet.fetchTimestamp.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          {/* Tab Buttons */}
          <nav className="flex gap-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setTab("hitung")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === "hitung"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Hitung
            </button>
            <button
              onClick={() => setTab("riwayat")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === "riwayat"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Riwayat
              {items.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                  {items.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {tab === "hitung" ? (
          <Calculator onSave={handleSave} exchangeRates={sheet.exchangeRates} hsCodes={sheet.hsCodes} sheetLoaded={sheet.isLoaded} />
        ) : (
          <SavedList items={items} onRemove={remove} onClearAll={clearAll} />
        )}
      </main>
    </div>
  );
}