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
    price: 0,
    label: '$0 Free (100% Unlocked)',
    teamLabel: 'Free',
    eduLabel: 'Free',
    usdRef: null,
  },
  INR: {
    symbol: '₹',
    price: 0,
    label: '₹0 Free (100% Unlocked)',
    teamLabel: 'Free',
    eduLabel: 'Free',
    usdRef: null,
  },
  GBP: {
    symbol: '£',
    price: 0,
    label: '£0 Free (100% Unlocked)',
    teamLabel: 'Free',
    eduLabel: 'Free',
    usdRef: null,
  },
  EUR: {
    symbol: '€',
    price: 0,
    label: '€0 Free (100% Unlocked)',
    teamLabel: 'Free',
    eduLabel: 'Free',
    usdRef: null,
  },
  JPY: {
    symbol: '¥',
    price: 0,
    label: '¥0 Free (100% Unlocked)',
    teamLabel: 'Free',
    eduLabel: 'Free',
    usdRef: null,
  },
  BRL: {
    symbol: 'R$',
    price: 0,
    label: 'R$0 Free (100% Unlocked)',
    teamLabel: 'Free',
    eduLabel: 'Free',
    usdRef: null,
  },
  AUD: {
    symbol: 'A$',
    price: 0,
    label: 'A$0 Free (100% Unlocked)',
    teamLabel: 'Free',
    eduLabel: 'Free',
    usdRef: null,
  },
};
