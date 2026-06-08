import { useState, useCallback, useRef, useEffect } from "react";
import { useTaxCalc, type TaxCalcInput, type TaxCalcResult } from "../hooks/useTaxCalc";
import type { SavedCalc } from "../hooks/useSavedCalcs";
import ResultBreakdown from "./ResultBreakdown";

interface HSCodeEntry {
  code: string;
  kategori: string;
  tarifBM: number;
}

interface Props {
  onSave: (result: TaxCalcResult, extras: Omit<SavedCalc, keyof TaxCalcResult | "id" | "date">) => void;
  exchangeRates: Record<string, number>;
  hsCodes: HSCodeEntry[];
  sheetLoaded: boolean;
}

const FALLBACK_RATES: Record<string, number> = {
  USD: 16500,
  RMB: 2300,
  SGD: 12500,
};

const defaultInput: TaxCalcInput = {
  itemName: "",
  purchasePrice: 0,
  currency: "USD",
  exchangeRate: 16500,
  shipping: 0,
  hsCode: "",
  dutyRate: 7.5,
  hasNPWP: true,
};

export default function Calculator({ onSave, exchangeRates, hsCodes, sheetLoaded }: Props) {
  const [input, setInput] = useState<TaxCalcInput>(defaultInput);
  const [saved, setSaved] = useState(false);
  const [hsSuggestions, setHsSuggestions] = useState<HSCodeEntry[]>([]);
  const [selectedHsKategori, setSelectedHsKategori] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const hsInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync exchange rate from sheet data once real data finishes loading
  const prevLoaded = useRef(false);
  useEffect(() => {
    if (sheetLoaded && !prevLoaded.current) {
      prevLoaded.current = true;
      const rate = exchangeRates[input.currency];
      if (rate) {
        setInput((prev) => ({
          ...prev,
          exchangeRate: rate,
        }));
      }
    }
  }, [sheetLoaded, exchangeRates, input.currency]);

  const result = useTaxCalc(input);

  const update = useCallback(
    <K extends keyof TaxCalcInput>(key: K, value: TaxCalcInput[K]) => {
      setInput((prev) => ({ ...prev, [key]: value }));
      setSaved(false);
    },
    []
  );

  const handleCurrencyChange = (currency: TaxCalcInput["currency"]) => {
    const rate = exchangeRates[currency] ?? FALLBACK_RATES[currency] ?? 0;
    setInput((prev) => ({
      ...prev,
      currency,
      exchangeRate: rate || prev.exchangeRate,
    }));
    setSaved(false);
  };

  const handleHsCodeChange = (value: string) => {
    setInput((prev) => ({ ...prev, hsCode: value }));
    setSaved(false);
    setSelectedHsKategori("");

    if (value.trim().length > 0) {
      const q = value.trim().toLowerCase();
      const filtered = hsCodes.filter(
        (h) =>
          h.code.toLowerCase().includes(q) ||
          h.kategori.toLowerCase().includes(q)
      );
      setHsSuggestions(filtered.slice(0, 10));
      setShowDropdown(filtered.length > 0);
    } else {
      setHsSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelectHs = (entry: HSCodeEntry) => {
    setInput((prev) => ({
      ...prev,
      hsCode: entry.code,
      dutyRate: entry.tarifBM,
    }));
    setSelectedHsKategori(entry.kategori);
    setShowDropdown(false);
    setSaved(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        hsInputRef.current &&
        !hsInputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = () => {
    if (!result) return;
    onSave(result, {
      currency: input.currency,
      exchangeRate: input.exchangeRate,
      shipping: input.shipping,
      hsCode: input.hsCode,
      dutyRate: input.dutyRate,
      hasNPWP: input.hasNPWP,
    });
    setSaved(true);
  };

  const handleReset = () => {
    setInput(defaultInput);
    setSaved(false);
    setHsSuggestions([]);
    setSelectedHsKategori("");
    setShowDropdown(false);
  };

  return (
    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
      {/* Input Form */}
      <div className="rounded-xl border border-green-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-green-700">
          Data Barang
        </h3>
        <div className="space-y-4">
          {/* Item Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Barang
            </label>
            <input
              type="text"
              value={input.itemName}
              onChange={(e) => update("itemName", e.target.value)}
              placeholder="Contoh: PCB Connector"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Harga Beli
            </label>
            <div className="flex gap-2">
              <select
                value={input.currency}
                onChange={(e) => handleCurrencyChange(e.target.value as TaxCalcInput["currency"])}
                className="w-24 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              >
                <option value="USD">USD</option>
                <option value="RMB">RMB</option>
                <option value="SGD">SGD</option>
              </select>
              <input
                type="number"
                value={input.purchasePrice || ""}
                onChange={(e) => update("purchasePrice", Number(e.target.value))}
                placeholder="0"
                min="0"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          {/* Exchange Rate */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Kurs ke IDR
            </label>
            <input
              type="number"
              value={input.exchangeRate || ""}
              onChange={(e) => update("exchangeRate", Number(e.target.value))}
              placeholder="16500"
              min="0"
              step="50"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Shipping */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Estimasi Ongkir ke Batam (IDR)
            </label>
            <input
              type="number"
              value={input.shipping || ""}
              onChange={(e) => update("shipping", Number(e.target.value))}
              placeholder="0"
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            />
          </div>

          {/* HS Code with dropdown */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Kode HS
            </label>
            <div className="relative">
              <input
                ref={hsInputRef}
                type="text"
                value={input.hsCode}
                onChange={(e) => handleHsCodeChange(e.target.value)}
                onFocus={() => {
                  if (hsSuggestions.length > 0) setShowDropdown(true);
                }}
                placeholder="Contoh: 8536.90"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />
              {selectedHsKategori && (
                <p className="mt-1 text-xs text-gray-400">
                  {selectedHsKategori}
                </p>
              )}
              {showDropdown && hsSuggestions.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                >
                  {hsSuggestions.map((entry, idx) => (
                    <button
                      key={`${entry.code}-${idx}`}
                      type="button"
                      onClick={() => handleSelectHs(entry)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-green-50 transition-colors"
                    >
                      <span className="font-medium text-gray-800">
                        {entry.code}
                      </span>
                      <span className="text-xs text-gray-500">
                        {entry.kategori} · {entry.tarifBM}%
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Duty Rate */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tarif Bea Masuk (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={input.dutyRate}
                onChange={(e) => update("dutyRate", Number(e.target.value))}
                placeholder="7.5"
                min="0"
                step="0.5"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>

          {/* NPWP Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status NPWP
            </label>
            <button
              type="button"
              onClick={() => update("hasNPWP", !input.hasNPWP)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                input.hasNPWP ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  input.hasNPWP ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="ml-2 text-sm text-gray-600">
              {input.hasNPWP ? "Punya NPWP" : "Tidak Punya NPWP"}
            </span>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="space-y-4">
        {result ? (
          <>
            <ResultBreakdown result={result} />

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
                  saved
                    ? "bg-green-400 cursor-default"
                    : "bg-green-600 hover:bg-green-700 active:bg-green-800"
                }`}
              >
                {saved ? "✓ Tersimpan!" : "Simpan Kalkulasi"}
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              Masukkan nama barang dan harga beli untuk melihat rincian biaya.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}