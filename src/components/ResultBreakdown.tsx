import type { TaxCalcResult } from "../hooks/useTaxCalc";
import { formatCurrency } from "../utils/formatCurrency";

interface Props {
  result: TaxCalcResult;
}

export default function ResultBreakdown({ result }: Props) {
  const lines = [
    { label: "1. Harga dalam IDR", value: formatCurrency(result.priceIDR) },
    { label: "2. Asuransi (0,5%)", value: formatCurrency(result.insurance) },
    { label: "3. CIF (Harga + Ongkir + Asuransi)", value: formatCurrency(result.cif) },
    { label: "4. Bea Masuk", value: formatCurrency(result.beaMasuk) },
    { label: "5. Dasar Pengenaan Pajak (CIF + BM)", value: formatCurrency(result.pdriBase) },
    { label: "6. PPN (11%)", value: formatCurrency(result.ppn) },
    { label: "7. PPh 22", value: formatCurrency(result.pph22) },
    { label: "8. Total Pajak", value: formatCurrency(result.totalTax), bold: true },
    { label: "9. Final Landed Cost", value: formatCurrency(result.finalLandedCost), bold: true, accent: true },
  ];

  return (
    <div className="rounded-xl border border-green-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-green-700">
        Rincian Biaya — {result.itemName}
      </h3>
      <div className="space-y-2">
        {lines.map((line) => (
          <div
            key={line.label}
            className={`flex justify-between items-center py-1.5 ${
              line.accent
                ? "border-t-2 border-green-500 pt-3 mt-2"
                : line.bold
                  ? "border-t border-green-200 pt-2 mt-1"
                  : ""
            }`}
          >
            <span
              className={`text-sm ${
                line.bold ? "font-semibold text-gray-800" : "text-gray-600"
              }`}
            >
              {line.label}
            </span>
            <span
              className={`font-mono text-sm ${
                line.accent
                  ? "text-lg font-bold text-green-700"
                  : line.bold
                    ? "font-semibold text-gray-800"
                    : "text-gray-700"
              }`}
            >
              {line.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}