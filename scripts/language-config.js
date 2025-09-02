/**
 * Language and locale configuration for multilingual multisite
 * Supports both lang/country (en/uk) and country/lang (ch/de, ch/fr) formats
 */

// Supported languages (ISO 639-1)
export const SUPPORTED_LANGUAGES = [
  'en', // English
  'de', // German
  'fr', // French
  'it', // Italian
  'pl', // Polish
];

// Supported countries (ISO 3166-1 alpha-2)
export const SUPPORTED_COUNTRIES = [
  'uk', // United Kingdom
  'us', // United States
  'ch', // Switzerland
  'de', // Germany
  'fr', // France
  'it', // Italy
  'pl', // Poland
];

// Countries that use country-first URL structure (e.g., /ch/de, /ch/fr)
// All others use language-first (e.g., /en/uk, /de/de)
export const COUNTRY_FIRST_LOCALES = ['ch'];

// Supported locale combinations
export const SUPPORTED_LOCALES = [
  {
    lang: 'en', country: 'uk', hreflang: 'en-GB', name: 'English (UK)',
  },
  {
    lang: 'en', country: 'us', hreflang: 'en-US', name: 'English (US)',
  },
  {
    lang: 'de', country: 'ch', hreflang: 'de-CH', name: 'Deutsch (Schweiz)',
  },
  {
    lang: 'fr', country: 'ch', hreflang: 'fr-CH', name: 'Français (Suisse)',
  },
  {
    lang: 'de', country: 'de', hreflang: 'de-DE', name: 'Deutsch (Deutschland)',
  },
  {
    lang: 'fr', country: 'fr', hreflang: 'fr-FR', name: 'Français (France)',
  },
  {
    lang: 'it', country: 'it', hreflang: 'it-IT', name: 'Italiano (Italia)',
  },
  {
    lang: 'pl', country: 'pl', hreflang: 'pl-PL', name: 'Polski (Polska)',
  },
];

// Default locale (fallback)
export const DEFAULT_LOCALE = { lang: 'en', country: 'uk' };

/**
 * Get locale order for a given country
 * @param {string} country Country code
 * @returns {string} 'country-lang' or 'lang-country'
 */
export function getLocaleOrder(country) {
  return COUNTRY_FIRST_LOCALES.includes(country) ? 'country-lang' : 'lang-country';
}

/**
 * Check if a language is supported
 * @param {string} lang Language code
 * @returns {boolean} True if supported
 */
export function isLanguageSupported(lang) {
  return SUPPORTED_LANGUAGES.includes(lang);
}

/**
 * Check if a country is supported
 * @param {string} country Country code
 * @returns {boolean} True if supported
 */
export function isCountrySupported(country) {
  return SUPPORTED_COUNTRIES.includes(country);
}

/**
 * Check if a locale combination is supported
 * @param {string} lang Language code
 * @param {string} country Country code
 * @returns {boolean} True if supported
 */
export function isLocaleSupported(lang, country) {
  return SUPPORTED_LOCALES.some((locale) => locale.lang === lang && locale.country === country);
}

/**
 * Get locale information by language and country
 * @param {string} lang Language code
 * @param {string} country Country code
 * @returns {Object|null} Locale object or null if not found
 */
export function getLocale(lang, country) {
  return SUPPORTED_LOCALES.find((locale) => locale.lang === lang && locale.country === country)
   || null;
}

/**
 * Get all supported locales
 * @returns {Array} Array of locale objects
 */
export function getAllLocales() {
  return [...SUPPORTED_LOCALES];
}
