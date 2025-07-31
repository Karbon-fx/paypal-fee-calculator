
export type Currency = {
  code: string;
  name: string;
  symbol: string;
  fixedFee: number;
};

export type FeeTier = {
  id: string;
  name: string;
  percentage: number;
  minAmount?: number;
  maxAmount?: number;
};

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'USD (United States)', symbol: '$', fixedFee: 0.30 },
  { code: 'GBP', name: 'GBP (United Kingdom)', symbol: '£', fixedFee: 0.20 },
  { code: 'CAD', name: 'CAD (Canada)', symbol: 'C$', fixedFee: 0.55 },
  { code: 'AED', name: 'AED (United Arab Emirates)', symbol: 'AED', fixedFee: 0.30 },
  { code: 'SGD', name: 'SGD (Singapore)', symbol: 'S$', fixedFee: 0.50 },
  { code: 'CNY', name: 'CNY (China)', symbol: '¥', fixedFee: 0.30 },
  { code: 'INR', name: 'INR (India)', symbol: '₹', fixedFee: 3.00 },
  { code: 'AUD', name: 'AUD (Australia)', symbol: 'A$', fixedFee: 0.30 },
  { code: 'EUR', name: 'EUR (Eurozone)', symbol: '€', fixedFee: 0.35 },
];

export const FEE_STRUCTURE: { [key: string]: FeeTier[] } = {
  USD: [
    { id: 'usd_tier1', name: '4.4% + {symbol}{fixedFee} (up to {symbol}3,000/month)', percentage: 4.4, maxAmount: 3000 },
    { id: 'usd_tier2', name: '3.9% + {symbol}{fixedFee} ({symbol}3,000.01 – {symbol}10,000/month)', percentage: 3.9, minAmount: 3000.01, maxAmount: 10000 },
    { id: 'usd_tier3', name: '3.7% + {symbol}{fixedFee} ({symbol}10,000.01 – {symbol}100,000/month)', percentage: 3.7, minAmount: 10000.01, maxAmount: 100000 },
    { id: 'usd_tier4', name: '3.4% + {symbol}{fixedFee} (Above {symbol}100,000/month)', percentage: 3.4, minAmount: 100000.01 },
  ],
  GBP: [
    { id: 'gbp_tier1', name: '4.4% + {symbol}{fixedFee} (up to {symbol}3,000/month)', percentage: 4.4, maxAmount: 3000 },
    { id: 'gbp_tier2', name: '3.9% + {symbol}{fixedFee} ({symbol}3,000.01 – {symbol}10,000/month)', percentage: 3.9, minAmount: 3000.01, maxAmount: 10000 },
    { id: 'gbp_tier3', name: '3.7% + {symbol}{fixedFee} ({symbol}10,000.01 – {symbol}100,000/month)', percentage: 3.7, minAmount: 10000.01, maxAmount: 100000 },
    { id: 'gbp_tier4', name: '3.4% + {symbol}{fixedFee} (Above {symbol}100,000/month)', percentage: 3.4, minAmount: 100000.01 },
  ],
  CAD: [
    { id: 'cad_tier1', name: '4.4% + {fixedFee} {symbol} (up to 3,000 {symbol}/month)', percentage: 4.4, maxAmount: 3000 },
    { id: 'cad_tier2', name: '3.9% + {fixedFee} {symbol} (3,000.01 – 10,000 {symbol}/month)', percentage: 3.9, minAmount: 3000.01, maxAmount: 10000 },
    { id: 'cad_tier3', name: '3.7% + {fixedFee} {symbol} (10,000.01 – 100,000 {symbol}/month)', percentage: 3.7, minAmount: 10000.01, maxAmount: 100000 },
    { id: 'cad_tier4', name: '3.4% + {fixedFee} {symbol} (Above 100,000 {symbol}/month)', percentage: 3.4, minAmount: 100000.01 },
  ],
  AED: [
    { id: 'aed_tier1', name: '4.4% + {symbol}{fixedFee} (up to {symbol}3,000/month)', percentage: 4.4, maxAmount: 3000 },
    { id: 'aed_tier2', name: '3.9% + {symbol}{fixedFee} ({symbol}3,000.01 – {symbol}10,000/month)', percentage: 3.9, minAmount: 3000.01, maxAmount: 10000 },
    { id: 'aed_tier3', name: '3.7% + {symbol}{fixedFee} ({symbol}10,000.01 – {symbol}100,000/month)', percentage: 3.7, minAmount: 10000.01, maxAmount: 100000 },
    { id: 'aed_tier4', name: '3.4% + {symbol}{fixedFee} (Above {symbol}100,000/month)', percentage: 3.4, minAmount: 100000.01 },
  ],
  SGD: [
    { id: 'sgd_tier1', name: '4.4% + {fixedFee} {symbol} (up to 5,000 {symbol}/month)', percentage: 4.4, maxAmount: 5000 },
    { id: 'sgd_tier2', name: '3.9% + {fixedFee} {symbol} (5,001 – 15,000 {symbol}/month)', percentage: 3.9, minAmount: 5001, maxAmount: 15000 },
    { id: 'sgd_tier3', name: '3.7% + {fixedFee} {symbol} (15,001 – 25,000 {symbol}/month)', percentage: 3.7, minAmount: 15001, maxAmount: 25000 },
    { id: 'sgd_tier4', name: '3.4% + {fixedFee} {symbol} (25,001 – 150,000 {symbol}/month)', percentage: 3.4, minAmount: 25001, maxAmount: 150000 },
    { id: 'sgd_tier5', name: '3.2% + {fixedFee} {symbol} (Above 150,000 {symbol}/month)', percentage: 3.2, minAmount: 150001 },
  ],
  CNY: [
    { id: 'cny_tier1', name: '4.4% + {symbol}{fixedFee} (up to {symbol}3,000/month)', percentage: 4.4, maxAmount: 3000 },
    { id: 'cny_tier2', name: '3.9% + {symbol}{fixedFee} ({symbol}3,000.01 – {symbol}10,000/month)', percentage: 3.9, minAmount: 3000.01, maxAmount: 10000 },
    { id: 'cny_tier3', name: '3.7% + {symbol}{fixedFee} ({symbol}10,000.01 – {symbol}100,000/month)', percentage: 3.7, minAmount: 10000.01, maxAmount: 100000 },
    { id: 'cny_tier4', name: '3.4% + {symbol}{fixedFee} (Above {symbol}100,000/month)', percentage: 3.4, minAmount: 100000.01 },
  ],
  INR: [
    { id: 'inr_local', name: 'Local: 2.5% + {symbol}{fixedFee}', percentage: 2.5 },
    { id: 'inr_tier1', name: 'International: 4.4% + {symbol}{fixedFee} (up to {symbol}3,000/month)', percentage: 4.4, maxAmount: 3000 },
    { id: 'inr_tier2', name: 'International: 3.9% + {symbol}{fixedFee} ({symbol}3,000+ to {symbol}10,000/month)', percentage: 3.9, minAmount: 3000.01, maxAmount: 10000 },
    { id: 'inr_tier3', name: 'International: 3.7% + {symbol}{fixedFee} ({symbol}10,000+ to {symbol}100,000/month)', percentage: 3.7, minAmount: 10000.01, maxAmount: 100000 },
    { id: 'inr_tier4', name: 'International: 3.4% + {symbol}{fixedFee} (Above {symbol}100,000/month)', percentage: 3.4, minAmount: 100000.01 },
  ],
  AUD: [
    { id: 'aud_tier1', name: '4.4% + 0.30 AUD (up to 1,500 AUD/month)', percentage: 4.4, maxAmount: 1500 },
    { id: 'aud_tier2', name: '3.9% + 0.30 AUD (1,500.01 – 6,000 AUD/month)', percentage: 3.9, minAmount: 1500.01, maxAmount: 6000 },
    { id: 'aud_tier3', name: '3.7% + 0.30 AUD (6,000.01 – 15,000 AUD/month)', percentage: 3.7, minAmount: 6000.01, maxAmount: 15000 },
    { id: 'aud_tier4', name: '3.4% + 0.30 AUD (15,000.01 – 50,000 AUD/month)', percentage: 3.4, minAmount: 15000.01, maxAmount: 50000 },
  ],
  EUR: [
    { id: 'eur_tier1', name: '4.4% + {symbol}{fixedFee} (Up to {symbol}3,000/month)', percentage: 4.4, maxAmount: 3000 },
    { id: 'eur_tier2', name: '3.9% + {symbol}{fixedFee} ({symbol}3,000.01 – {symbol}10,000/month)', percentage: 3.9, minAmount: 3000.01, maxAmount: 10000 },
    { id: 'eur_tier3', name: '3.7% + {symbol}{fixedFee} ({symbol}10,000.01 – {symbol}100,000/month)', percentage: 3.7, minAmount: 10000.01, maxAmount: 100000 },
    { id: 'eur_tier4', name: '3.4% + {symbol}{fixedFee} (Above {symbol}100,000/month)', percentage: 3.4, minAmount: 100000.01 },
  ],
};

// This is PayPal's markup on the wholesale exchange rate for currency conversion.
export const CURRENCY_CONVERSION_MARKUP = 0.04; // 4%
