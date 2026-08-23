/**
 * src/hooks/useRegionalPricing.ts — Bulletproof Regional Currency Detection & Scoped Manual Override
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
    const locale = (navigator.language || '').toUpperCase();
    const languages = (navigator.languages || []).map((l) => l.toUpperCase());
    const offsetMinutes = new Date().getTimezoneOffset(); // -330 for UTC+5:30 (India)

    // 🇮🇳 INDIA DETECTION (Asia/Kolkata, Asia/Calcutta, UTC+5:30 offset = -330, en-IN, hi-IN)
    if (
      timeZone.includes('Kolkata') ||
      timeZone.includes('Calcutta') ||
      offsetMinutes === -330 ||
      locale.includes('IN') ||
      locale.includes('HI') ||
      languages.some((l) => l.includes('IN') || l.includes('HI'))
    ) {
      return { countryName: 'India', flag: '🇮🇳', detectedCurrency: 'INR' };
    }

    // 🇬🇧 UNITED KINGDOM
    if (
      timeZone.includes('London') ||
      locale.includes('GB') ||
      languages.some((l) => l.includes('GB'))
    ) {
      return { countryName: 'United Kingdom', flag: '🇬🇧', detectedCurrency: 'GBP' };
    }

    // 🇪🇺 EUROPEAN UNION
    if (
      timeZone.includes('Paris') ||
      timeZone.includes('Berlin') ||
      timeZone.includes('Rome') ||
      timeZone.includes('Madrid') ||
      timeZone.includes('Amsterdam') ||
      timeZone.includes('Brussels') ||
      timeZone.includes('Europe') ||
      locale.includes('FR') ||
      locale.includes('DE') ||
      locale.includes('ES') ||
      locale.includes('IT') ||
      locale.includes('NL')
    ) {
      return { countryName: 'European Union', flag: '🇪🇺', detectedCurrency: 'EUR' };
    }

    // 🇯🇵 JAPAN
    if (
      timeZone.includes('Tokyo') ||
      offsetMinutes === -540 ||
      locale.includes('JP') ||
      locale.includes('JA')
    ) {
      return { countryName: 'Japan', flag: '🇯🇵', detectedCurrency: 'JPY' };
    }

    // 🇧🇷 BRAZIL
    if (
      timeZone.includes('Sao_Paulo') ||
      locale.includes('BR') ||
      locale.includes('PT-BR')
    ) {
      return { countryName: 'Brazil', flag: '🇧🇷', detectedCurrency: 'BRL' };
    }

    // 🇦🇺 AUSTRALIA
    if (
      timeZone.includes('Sydney') ||
      timeZone.includes('Melbourne') ||
      timeZone.includes('Brisbane') ||
      timeZone.includes('Perth') ||
      timeZone.includes('Australia') ||
      locale.includes('AU')
    ) {
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
