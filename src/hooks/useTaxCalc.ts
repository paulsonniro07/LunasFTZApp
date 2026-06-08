export interface TaxCalcInput {
  itemName: string;
  purchasePrice: number;
  currency: "USD" | "RMB" | "SGD";
  exchangeRate: number;
  shipping: number;
  hsCode: string;
  dutyRate: number;
  hasNPWP: boolean;
}

export interface TaxCalcResult {
  itemName: string;
  priceIDR: number;
  insurance: number;
  cif: number;
  beaMasuk: number;
  pdriBase: number;
  ppn: number;
  pph22: number;
  totalTax: number;
  finalLandedCost: number;
}

export function useTaxCalc(input: TaxCalcInput): TaxCalcResult | null {
  if (
    !input.itemName ||
    input.purchasePrice <= 0 ||
    input.exchangeRate <= 0 ||
    input.shipping < 0 ||
    input.dutyRate < 0
  ) {
    return null;
  }

  const priceIDR = input.purchasePrice * input.exchangeRate;
  const insurance = priceIDR * 0.005; // 0.5%
  const cif = priceIDR + input.shipping + insurance;
  const beaMasuk = cif * (input.dutyRate / 100);
  const pdriBase = cif + beaMasuk;
  const ppn = pdriBase * 0.11; // 11%

  // PPh 22: only if CIF > 1,500,000 IDR
  let pph22 = 0;
  if (cif > 1500000) {
    const rate = input.hasNPWP ? 0.025 : 0.05;
    pph22 = pdriBase * rate;
  }

  const totalTax = beaMasuk + ppn + pph22;
  const finalLandedCost = priceIDR + totalTax + input.shipping;

  return {
    itemName: input.itemName,
    priceIDR,
    insurance,
    cif,
    beaMasuk,
    pdriBase,
    ppn,
    pph22,
    totalTax,
    finalLandedCost,
  };
}