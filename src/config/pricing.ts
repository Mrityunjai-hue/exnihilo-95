/**
 * src/config/pricing.ts — Normalized Accessible Minimum Tier Pricing
 *
 * NOTE: Review quarterly or when FX rates move > 10%.
 * GitHub Issue: "Quarterly: Review Pro pricing FX rates"
 */

export interface PricingTier {
  symbol: string;
  price: number;
  label: string;      // Pro price label e.g. ₹199/mo
  teamLabel: string;  // Team price label e.g. ₹499/mo
  eduLabel: string;   // Education price label e.g. ₹49/mo
  usdRef: string | null;
}

export const PRO_PRICING: Record<string, PricingTier> = {
  USD: {
    symbol: '$',
    price: 2.99,
    label: '$2.99/mo',
    teamLabel: '$6.99/mo',
    eduLabel: '$0.99/mo',
    usdRef: null,
  },
  INR: {
    symbol: '₹',
    price: 199,
    label: '₹199/mo',
    teamLabel: '₹499/mo',
    eduLabel: '₹49/mo',
    usdRef: '~$2.49 USD',
  },
  GBP: {
    symbol: '£',
    price: 2.49,
    label: '£2.49/mo',
    teamLabel: '£5.99/mo',
    eduLabel: '£0.79/mo',
    usdRef: '~$3 USD',
  },
  EUR: {
    symbol: '€',
    price: 2.99,
    label: '€2.99/mo',
    teamLabel: '€6.99/mo',
    eduLabel: '€0.99/mo',
    usdRef: '~$3 USD',
  },
  JPY: {
    symbol: '¥',
    price: 390,
    label: '¥390/mo',
    teamLabel: '¥990/mo',
    eduLabel: '¥140/mo',
    usdRef: '~$2.60 USD',
  },
  BRL: {
    symbol: 'R$',
    price: 14.90,
    label: 'R$14.90/mo',
    teamLabel: 'R$34.90/mo',
    eduLabel: 'R$4.90/mo',
    usdRef: '~$2.70 USD',
  },
  AUD: {
    symbol: 'A$',
    price: 4.49,
    label: 'A$4.49/mo',
    teamLabel: 'A$9.99/mo',
    eduLabel: 'A$1.49/mo',
    usdRef: '~$2.90 USD',
  },
};
