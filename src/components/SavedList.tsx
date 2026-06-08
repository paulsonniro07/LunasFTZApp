import type { SavedCalc } from "../hooks/useSavedCalcs";
import { formatCurrency } from "../utils/formatCurrency";

interface Props {
  items: SavedCalc[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export default function SavedList({ items, onRemove, onClearAll }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">Belum ada kalkulasi tersimpan.</p>
        <p className="mt-1 text-sm text-gray-400">
          Hitung biaya impor lalu simpan hasilnya di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Riwayat Kalkulasi
        </h3>
        <button
          onClick={onClearAll}
          className="rounded-lg px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Hapus Semua
        </button>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {item.itemName}
              </p>
              <p className="mt-1 text-xs text-gray-500">{item.date}</p>
              <p className="mt-2 text-sm font-bold text-green-700">
                {formatCurrency(item.finalLandedCost)}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                Kurs: {item.currency} {item.exchangeRate} | Ongkir:{" "}
                {formatCurrency(item.shipping)}
              </p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="ml-3 shrink-0 rounded-lg px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}