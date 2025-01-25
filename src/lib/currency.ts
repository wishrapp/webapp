// Currency codes for each country
const countryCurrencies: Record<string, string> = {
  GB: 'GBP', // British Pound
  US: 'USD', // US Dollar
  EU: 'EUR', // Euro
  // Add more as needed
};

// Default fallback currency
const DEFAULT_CURRENCY = 'USD';

export function formatCurrency(amount: number | null, countryCode: string): string {
  if (amount === null) return '';

  const currency = countryCurrencies[countryCode] || DEFAULT_CURRENCY;
  
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    // Fallback to basic formatting if Intl.NumberFormat fails
    return `${currency} ${amount.toFixed(2)}`;
  }
}