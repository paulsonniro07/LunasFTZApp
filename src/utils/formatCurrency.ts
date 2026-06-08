export function formatCurrency(amount: number): string {
  // Format number with thousand separator using dots (Indonesian format)
  const integer = Math.floor(amount);
  const formatted = integer
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${formatted}`;
}