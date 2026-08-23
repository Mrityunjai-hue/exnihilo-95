/**
 * src/config/pricing.ts — Single Source of Truth for All Tier Pricing across Currencies
 *
 * NOTE: Review quarterly or when FX rates move > 10%.
 * GitHub Issue: "Quarterly: Review Pro pricing FX rates"
 */

export interface PricingTier {
  symbol: string;
  price: number;
  label: string;      // Pro price label e.g. ₹749/mo
  teamLabel: string;  // Team price label e.g. ₹1,599/mo
  eduLabel: string;   // Education price label e.g. ₹329/mo
  usdRef: string | null;
}

export const PRO_PRICING: Record<string, PricingTier> = {
  USD: {
    symbol: '$',
    price: 9,
    label: '$9/mo',
    teamLabel: '$19/mo',
    eduLabel: '$4/mo',
    usdRef: null,
  },
  INR: {
    symbol: '₹',
    price: 749,
    label: '₹749/mo',
    teamLabel: '₹1,599/mo',
    eduLabel: '₹329/mo',
    usdRef: '~$9 USD',
  },
  GBP: {
    symbol: '£',
    price: 7,
    label: '£7/mo',
    teamLabel: '£15/mo',
    eduLabel: '£3/mo',
    usdRef: '~$9 USD',
  },
  EUR: {
    symbol: '€',
    price: 8.50,
    label: '€8.50/mo',
    teamLabel: '€18/mo',
    eduLabel: '€3.90/mo',
    usdRef: '~$9 USD',
  },
  JPY: {
    symbol: '¥',
    price: 1350,
    label: '¥1,350/mo',
    teamLabel: '¥2,850/mo',
    eduLabel: '¥600/mo',
    usdRef: '~$9 USD',
  },
  BRL: {
    symbol: 'R$',
    price: 49,
    label: 'R$49/mo',
    teamLabel: 'R$99/mo',
    eduLabel: 'R$22/mo',
    usdRef: '~$9 USD',
  },
  AUD: {
    symbol: 'A$',
    price: 14,
    label: 'A$14/mo',
    teamLabel: 'A$29/mo',
    eduLabel: 'A$6/mo',
    usdRef: '~$9 USD',
  },
};
