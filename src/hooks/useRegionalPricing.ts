/**
 * src/hooks/useRegionalPricing.ts — Regional Currency Detection & Scoped Manual Override
 */

import { useState, useEffect, useCallback } from 'react';
import { PRO_PRICING, PricingTier } from '../config/pricing';

interface RegionInfo {
  countryName: string;
  flag: string;
  detectedCurrency: string;
}

export function detectRegion(): RegionInfo {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const locale = navigator.language || 'en-US';

    if (timeZone.includes('Asia/Kolkata') || locale.includes('IN') || timeZone.includes('India')) {
      return { countryName: 'India', flag: '🇮🇳', detectedCurrency: 'INR' };
    }
    if (timeZone.includes('Europe/London') || locale.includes('GB')) {
      return { countryName: 'United Kingdom', flag: '🇬🇧', detectedCurrency: 'GBP' };
    }
    if (timeZone.includes('Europe/') || locale.includes('DE') || locale.includes('FR') || locale.includes('ES') || locale.includes('IT')) {
      return { countryName: 'European Union', flag: '🇪🇺', detectedCurrency: 'EUR' };
    }
    if (timeZone.includes('Asia/Tokyo') || locale.includes('JP')) {
      return { countryName: 'Japan', flag: '🇯🇵', detectedCurrency: 'JPY' };
    }
    if (timeZone.includes('America/Sao_Paulo') || locale.includes('BR')) {
      return { countryName: 'Brazil', flag: '🇧🇷', detectedCurrency: 'BRL' };
    }
    if (timeZone.includes('Australia/') || locale.includes('AU')) {
      return { countryName: 'Australia', flag: '🇦🇺', detectedCurrency: 'AUD' };
    }
  } catch (e) {
    // Fallback
  }
  return { countryName: 'United States', flag: '🇺🇸', detectedCurrency: 'USD' };
}

export function useRegionalPricing(usernameNorm: string | null) {
  const region = detectRegion();

  const getStorageKey = useCallback(() => {
    return usernameNorm ? `exnihilo_currency_${usernameNorm}` : 'exnihilo_currency_guest';
  }, [usernameNorm]);

  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    const key = usernameNorm ? `exnihilo_currency_${usernameNorm}` : 'exnihilo_currency_guest';
    const saved = localStorage.getItem(key);
    if (saved && PRO_PRICING[saved]) {
      return saved;
    }
    return region.detectedCurrency;
  });

  useEffect(() => {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved && PRO_PRICING[saved]) {
      setSelectedCurrency(saved);
    } else {
      setSelectedCurrency(region.detectedCurrency);
    }
  }, [usernameNorm, getStorageKey, region.detectedCurrency]);

  const setCurrencyOverride = (currencyCode: string) => {
    if (PRO_PRICING[currencyCode]) {
      setSelectedCurrency(currencyCode);
      const key = getStorageKey();
      localStorage.setItem(key, currencyCode);
    }
  };

  const pricingTier: PricingTier = PRO_PRICING[selectedCurrency] || PRO_PRICING.USD;

  return {
    region,
    selectedCurrency,
    setCurrencyOverride,
    pricingTier,
    availableCurrencies: Object.keys(PRO_PRICING),
  };
}
