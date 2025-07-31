import FeeCalculator from "@/components/fee-calculator";
import { CURRENCIES } from "@/lib/constants";

async function getExchangeRates() {
  const apiKey = process.env.FCA_API_KEY;
  if (!apiKey) {
    console.error("FCA_API_KEY is not defined in the environment variables.");
    // In a real app, you might want to return a default or cached rate,
    // but for this example, we'll return an empty object on failure.
    return {};
  }
  
  const baseCurrency = 'INR';
  // Exclude AED and the base currency INR from the API call
  const currencyCodes = CURRENCIES.map(c => c.code).filter(c => c !== baseCurrency && c !== 'AED');
  const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${baseCurrency}&currencies=${currencyCodes.join(',')}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Revalidate every hour
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch exchange rates. Status: ${response.status}. Body: ${errorText}`);
      return {};
    }
    const data = await response.json();
    if (data.errors || !data.data) {
      console.error(`API Error fetching exchange rates: ${JSON.stringify(data.errors || 'Unknown error')}`);
      return {};
    }
    return data.data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {};
  }
}


export default async function Home() {
  const apiRates = await getExchangeRates();

  // The API returns how many of the target currency 1 INR can buy.
  // We need the inverse for the calculator (how many INR is 1 unit of foreign currency).
  // The calculator does this inversion (1 / rate).
  // For AED, 1 AED = 23.88 INR. So the rate needs to be 1 / 23.88 so that when inverted it becomes 23.88.
  const aedRate = 1 / 23.88;
  const ratesForCalculator = {
    ...apiRates,
    AED: aedRate
  };

  const ratesForDisplay = Object.keys(ratesForCalculator).reduce((acc, currency) => {
    if (ratesForCalculator[currency] !== 0) {
      acc[currency] = `1 ${currency} = ${(1 / ratesForCalculator[currency]).toFixed(2)} INR`;
    }
    return acc;
  }, {} as {[key: string]: string});


  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md mx-auto">
        <FeeCalculator initialRates={ratesForCalculator} />
      </div>
    </main>
  );
}
