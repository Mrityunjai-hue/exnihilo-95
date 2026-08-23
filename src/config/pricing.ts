/**
 * src/config/pricing.ts — Single Source of Truth for Pro Pricing
 *
 * NOTE: Review quarterly or when FX rates move > 10%.
 * GitHub Issue: "Quarterly: Review Pro pricing FX rates"
 */

export interface PricingTier {
  symbol: string;
  price: number;
  label: string;
  usdRef: string | null;
}

export const PRO_PRICING: Record<string, PricingTier> = {
  USD: { symbol: '$',  price: 9,    label: '$9/mo',    usdRef: null },
  INR: { symbol: '₹',  price: 749,  label: '₹749/mo',  usdRef: '~$9 USD' },
  GBP: { symbol: '£',  price: 7,    label: '£7/mo',    usdRef: '~$9 USD' },
  EUR: { symbol: '€',  price: 8.50, label: '€8.50/mo', usdRef: '~$9 USD' },
  JPY: { symbol: '¥',  price: 1350, label: '¥1,350/mo',usdRef: '~$9 USD' },
  BRL: { symbol: 'R$', price: 49,   label: 'R$49/mo',  usdRef: '~$9 USD' },
  AUD: { symbol: 'A$', price: 14,   label: 'A$14/mo',  usdRef: '~$9 USD' },
};
