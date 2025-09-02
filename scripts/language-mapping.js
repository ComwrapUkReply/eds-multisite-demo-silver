import {
  getLocaleOrder,
  isLocaleSupported,
  getAllLocales,
  DEFAULT_LOCALE,
  COUNTRY_FIRST_LOCALES,
} from './language-config.js';

/**
 * Parse locale from URL path
 * @param {string} path URL path (e.g., '/en/uk/about' or '/ch/de/uber-uns')
 * @returns {Object} { order, lang, country, remainder, localePrefix, isValid }
 */
export function parseLocale(path) {
  const segments = path.split('/').filter(Boolean);

  if (segments.length < 2) {
    return {
      order: null,
      lang: null,
      country: null,
      remainder: path,
      localePrefix: '',
      isValid: false,
    };
  }

  const [first, second] = segments;
  const remainder = `/${segments.slice(2).join('/')}`;

  // Try country-first pattern (e.g., ch/de)
  if (COUNTRY_FIRST_LOCALES.includes(first)) {
    const isValid = isLocaleSupported(second, first);
    return {
      order: 'country-lang',
      lang: second,
      country: first,
      remainder,
      localePrefix: `/${first}/${second}`,
      isValid,
    };
  }

  // Try language-first pattern (e.g., en/uk)
  const isValid = isLocaleSupported(first, second);
  return {
    order: 'lang-country',
    lang: first,
    country: second,
    remainder,
    localePrefix: `/${first}/${second}`,
    isValid,
  };
}

/**
 * Build locale prefix from language and country
 * @param {string} lang Language code
 * @param {string} country Country code
 * @returns {string} Locale prefix (e.g., '/en/uk' or '/ch/de')
 */
export function buildLocalePrefix(lang, country) {
  const order = getLocaleOrder(country);
  return order === 'country-lang' ? `/${country}/${lang}` : `/${lang}/${country}`;
}

/**
 * Convert locale to key format for mappings
 * @param {string} lang Language code
 * @param {string} country Country code
 * @returns {string} Locale key (e.g., 'en-uk', 'de-ch')
 */
export function localeToKey(lang, country) {
  return `${lang}-${country}`;
}

/**
 * Parse locale key back to language and country
 * @param {string} localeKey Locale key (e.g., 'en-uk')
 * @returns {Object} { lang, country }
 */
export function keyToLocale(localeKey) {
  const [lang, country] = localeKey.split('-');
  return { lang, country };
}

// Cache for URL mappings
let urlMappingsCache = null;
let mappingsLoadPromise = null;

/**
 * Load URL mappings from Google Sheets or JSON fallback
 * @returns {Promise<Object>} Mappings object
 */
export async function loadMappings() {
  if (urlMappingsCache) {
    return urlMappingsCache;
  }

  if (mappingsLoadPromise) {
    return mappingsLoadPromise;
  }

  mappingsLoadPromise = (async () => {
    const mappings = {};

    try {
      // Try Google Sheets first
      const response = await fetch('/url-mappings.json');
      if (response.ok) {
        const data = await response.json();

        // Convert sheet data to mappings object
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((row) => {
            const sourceLocale = row.sourceLocale || row.sourcelocale;
            const sourcePath = row.sourcePath || row.sourcepath;
            const targetLocale = row.targetLocale || row.targetlocale;
            const targetPath = row.targetPath || row.targetpath;

            if (sourceLocale && sourcePath && targetLocale && targetPath) {
              if (!mappings[sourceLocale]) {
                mappings[sourceLocale] = {};
              }
              mappings[sourceLocale][sourcePath] = {
                targetLocale,
                targetPath,
              };
            }
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load mappings from Google Sheets:', error);
    }

    // Try JSON fallback if no mappings loaded
    if (Object.keys(mappings).length === 0) {
      try {
        const response = await fetch('/config/url-mappings.json');
        if (response.ok) {
          const jsonMappings = await response.json();
          Object.assign(mappings, jsonMappings);
        }
      } catch (error) {
        console.warn('Failed to load mappings from JSON:', error);
      }
    }

    urlMappingsCache = mappings;
    return mappings;
  })();

  return mappingsLoadPromise;
}

/**
 * Map current URL to target language/country
 * @param {string} currentPath Current URL path
 * @param {string} targetLang Target language
 * @param {string} targetCountry Target country
 * @returns {Promise<string>} Mapped URL or fallback
 */
export async function mapUrlToLanguage(currentPath, targetLang, targetCountry) {
  const currentLocale = parseLocale(currentPath);
  const targetLocaleKey = localeToKey(targetLang, targetCountry);
  const targetPrefix = buildLocalePrefix(targetLang, targetCountry);

  // If current path is not a valid locale, return target homepage
  if (!currentLocale.isValid) {
    return `${targetPrefix}/`;
  }

  const currentLocaleKey = localeToKey(currentLocale.lang, currentLocale.country);

  try {
    const mappings = await loadMappings();

    // Check for exact mapping
    if (mappings[currentLocaleKey] && mappings[currentLocaleKey][currentPath]) {
      const mapping = mappings[currentLocaleKey][currentPath];
      return mapping.targetPath;
    }
  } catch (error) {
    console.warn('Error loading mappings:', error);
  }

  // Fallback: try to preserve path structure
  if (currentLocale.remainder && currentLocale.remainder !== '/') {
    return `${targetPrefix}${currentLocale.remainder}`;
  }

  // Final fallback: target locale homepage
  return `${targetPrefix}/`;
}

/**
 * Get alternate URLs for all supported locales
 * @param {string} currentPath Current URL path
 * @returns {Promise<Object>} Object with locale keys and URLs
 */
export async function getAlternates(currentPath) {
  const alternates = {};
  const allLocales = getAllLocales();

  await Promise.all(
    allLocales.map(async (locale) => {
      const localeKey = localeToKey(locale.lang, locale.country);
      try {
        alternates[localeKey] = await mapUrlToLanguage(currentPath, locale.lang, locale.country);
      } catch (error) {
        console.warn(`Failed to get alternate for ${localeKey}:`, error);
        alternates[localeKey] = `${buildLocalePrefix(locale.lang, locale.country)}/`;
      }
    }),
  );

  return alternates;
}

/**
 * Get current locale from window.location
 * @returns {Object} Current locale info or default
 */
export function getCurrentLocale() {
  const parsed = parseLocale(window.location.pathname);

  if (parsed.isValid) {
    return {
      lang: parsed.lang,
      country: parsed.country,
      localeKey: localeToKey(parsed.lang, parsed.country),
      prefix: parsed.localePrefix,
    };
  }

  // Return default locale
  return {
    lang: DEFAULT_LOCALE.lang,
    country: DEFAULT_LOCALE.country,
    localeKey: localeToKey(DEFAULT_LOCALE.lang, DEFAULT_LOCALE.country),
    prefix: buildLocalePrefix(DEFAULT_LOCALE.lang, DEFAULT_LOCALE.country),
  };
}

/**
 * Clear mappings cache (useful for testing)
 */
export function clearMappingsCache() {
  urlMappingsCache = null;
  mappingsLoadPromise = null;
}
