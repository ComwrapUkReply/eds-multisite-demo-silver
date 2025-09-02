import { getCurrentLocale, getAlternates } from '../../scripts/language-mapping.js';

// Cache for language switcher configuration
let configCache = null;

/**
 * Load language switcher configuration
 * @param {HTMLElement} block The block element
 * @returns {Promise<Object>} Configuration object
 */
async function loadConfig(block) {
  if (configCache) {
    return configCache;
  }

  // Load runtime configuration
  let runtimeConfig = {};
  try {
    const response = await fetch('/blocks/language-switcher/language-switcher.json');
    if (response.ok) {
      runtimeConfig = await response.json();
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load language switcher runtime config:', error);
  }

  // Extract block configuration from data attributes or content
  const blockConfig = {
    displayMode: block.dataset.displayMode || 'dropdown',
    showCountryFlags: block.dataset.showCountryFlags !== 'false',
    groupByCountry: block.dataset.groupByCountry !== 'false',
    supportedLocales: block.dataset.supportedLocales?.split(',') || ['en-uk', 'de-ch', 'fr-ch'],
    fallbackLocale: block.dataset.fallbackLocale || 'en-uk',
    preservePath: block.dataset.preservePath !== 'false',
    autoDetect: block.dataset.autoDetect !== 'false',
    customLabel: block.dataset.customLabel || 'Select language and country',
  };

  // Merge runtime config with block config (block config takes precedence)
  configCache = {
    ...runtimeConfig,
    display: {
      ...runtimeConfig.display,
      showCountryFlags: blockConfig.showCountryFlags,
      groupByCountry: blockConfig.groupByCountry,
      compactMode: blockConfig.displayMode === 'compact',
    },
    behavior: {
      ...runtimeConfig.behavior,
      preservePath: blockConfig.preservePath,
      autoDetect: { ...runtimeConfig.behavior?.autoDetect, enabled: blockConfig.autoDetect },
    },
    ui: {
      ...runtimeConfig.ui,
      labels: {
        ...runtimeConfig.ui?.labels,
        selectLanguage: blockConfig.customLabel,
      },
    },
    supportedLocales: blockConfig.supportedLocales,
    fallbackLocale: blockConfig.fallbackLocale,
  };

  return configCache;
}

/**
 * Get country and language info from config
 * @param {Object} config Configuration object
 * @param {string} countryCode Country code
 * @param {string} langCode Language code
 * @returns {Object} Country and language info
 */
function getCountryLanguageInfo(config, countryCode, langCode) {
  const country = config.countries?.[countryCode];
  if (!country) {
    return null;
  }

  const language = country.languages?.find((lang) => lang.code === langCode);
  if (!language) {
    return null;
  }

  return {
    country: {
      code: countryCode,
      name: country.name,
      flag: country.flag,
      urlPattern: country.urlPattern,
    },
    language: {
      code: language.code,
      name: language.name,
      native: language.native,
      hreflang: language.hreflang,
      urlPath: language.urlPath,
    },
  };
}

/**
 * Get all available locales from config
 * @param {Object} config Configuration object
 * @returns {Array} Array of locale objects
 */
function getConfigLocales(config) {
  const locales = [];

  if (!config.countries) {
    return locales;
  }

  Object.entries(config.countries).forEach(([countryCode, country]) => {
    if (country.languages) {
      country.languages.forEach((language) => {
        locales.push({
          lang: language.code,
          country: countryCode,
          name: `${language.native} (${country.name})`,
          hreflang: language.hreflang,
          urlPath: language.urlPath,
          flag: country.flag,
        });
      });
    }
  });

  return locales;
}

/**
 * Creates a locale option element with country/language info
 * @param {Object} locale The locale object
 * @param {boolean} isCurrent Whether this is the current locale
 * @param {Object} placeholders The placeholders object
 * @param {string} mappedUrl The mapped URL for this locale
 * @param {Object} config Configuration object
 * @returns {HTMLElement} The locale option element
 */
function createLocaleOption(locale, isCurrent, placeholders, mappedUrl, config) {
  const li = document.createElement('li');
  li.classList.add('language-option');

  const localeKey = `${locale.lang}-${locale.country}`;
  const placeholderKey = `locale${localeKey.replace('-', '').toUpperCase()}`;

  // Get display text with flag if enabled
  let displayText = placeholders[placeholderKey] || locale.name;
  if (config.display?.showCountryFlags && locale.flag) {
    displayText = `${locale.flag} ${displayText}`;
  }

  if (isCurrent) {
    li.classList.add('current');
    const span = document.createElement('span');
    span.textContent = displayText;
    span.setAttribute('aria-current', 'page');
    li.appendChild(span);
  } else {
    const a = document.createElement('a');
    a.href = mappedUrl;
    a.textContent = displayText;
    a.setAttribute('hreflang', locale.hreflang);
    a.setAttribute('lang', locale.lang);
    const langName = locale.name.split(' (')[0];
    const countryName = locale.country.toUpperCase();
    const switchLabel = config.ui?.labels?.switchTo
      ?.replace('{language}', langName)
      ?.replace('{country}', countryName)
      || `Switch to ${locale.name}`;
    a.setAttribute('title', switchLabel);
    li.appendChild(a);
  }

  return li;
}

/**
 * Creates country group header for grouped display
 * @param {string} countryCode Country code
 * @param {Object} countryInfo Country information
 * @param {Object} config Configuration object
 * @returns {HTMLElement} Country group header element
 */
function createCountryGroupHeader(countryCode, countryInfo, config) {
  const li = document.createElement('li');
  li.classList.add('country-group-header');
  li.setAttribute('role', 'presentation');

  const span = document.createElement('span');
  let headerText = countryInfo.name;
  if (config.display?.showCountryFlags && countryInfo.flag) {
    headerText = `${countryInfo.flag} ${headerText}`;
  }
  span.textContent = headerText;
  li.appendChild(span);

  return li;
}

export default async function decorate(block) {
  // Check if this block is already decorated to avoid duplicates
  if (block.dataset.decorated === 'true') {
    return;
  }

  // Load configuration
  const config = await loadConfig(block);
  const currentLocaleInfo = getCurrentLocale();

  // Use config locales if available, fallback to empty array
  const allLocales = config.countries ? getConfigLocales(config) : [];

  let placeholders;
  try {
    placeholders = await fetchPlaceholders();
  } catch (error) {
    console.warn('Could not load placeholders, using defaults:', error);
    placeholders = {};
  }

  // Create language switcher container
  const container = document.createElement('div');
  container.classList.add('language-switcher-container');

  // Create current locale display
  const currentLanguageButton = document.createElement('button');
  currentLanguageButton.classList.add('language-switcher-button');
  currentLanguageButton.setAttribute('aria-expanded', 'false');
  currentLanguageButton.setAttribute(
    'aria-label',
    config.ui?.labels?.selectLanguage || placeholders.selectLanguage || 'Select language and country',
  );

  // Get current country/language info from config
  const currentInfo = getCountryLanguageInfo(
    config,
    currentLocaleInfo.country,
    currentLocaleInfo.lang,
  );

  let displayText = '';
  if (currentInfo) {
    displayText = config.display?.compactMode
      ? `${currentInfo.language.code.toUpperCase()}/${currentInfo.country.code.toUpperCase()}`
      : `${currentInfo.country.flag || ''} ${currentInfo.language.native}`.trim();
  } else {
    const fallback = `${currentLocaleInfo.lang.toUpperCase()}/${currentLocaleInfo.country.toUpperCase()}`;
    displayText = fallback;
  }

  currentLanguageButton.innerHTML = `
    <svg class="language-switcher-globe" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM11 19.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
    <span class="language-code">${displayText}</span>
    <svg class="language-switcher-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
      <path d="M7 10l5 5 5-5z"/>
    </svg>
  `;

  // Create locale list
  const languageList = document.createElement('ul');
  languageList.classList.add('language-list');
  languageList.setAttribute('role', 'list');
  languageList.setAttribute(
    'aria-label',
    config.ui?.labels?.availableOptions
      || placeholders.availableLanguages
      || 'Available languages and countries',
  );

  // Get alternate URLs for all locales
  let alternates = {};
  try {
    alternates = await getAlternates(window.location.pathname);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load alternates:', error);
  }

  // Group locales by country if enabled
  if (config.display?.groupByCountry && config.countries) {
    Object.entries(config.countries).forEach(([countryCode, countryInfo]) => {
      // Add country group header
      if (countryInfo.languages && countryInfo.languages.length > 1) {
        const groupHeader = createCountryGroupHeader(countryCode, countryInfo, config);
        languageList.appendChild(groupHeader);
      }

      // Add language options for this country
      countryInfo.languages?.forEach((language) => {
        const locale = allLocales.find(
          (l) => l.lang === language.code && l.country === countryCode,
        );
        if (locale) {
          const isCurrent = locale.lang === currentLocaleInfo.lang
            && locale.country === currentLocaleInfo.country;
          const localeKey = `${locale.lang}-${locale.country}`;
          const fallbackUrl = locale.urlPath || `/${locale.lang}/${locale.country}/`;
          const mappedUrl = isCurrent ? null : (alternates[localeKey] || fallbackUrl);

          const option = createLocaleOption(locale, isCurrent, placeholders, mappedUrl, config);
          languageList.appendChild(option);
        }
      });
    });
  } else {
    // Add locale options without grouping
    allLocales.forEach((locale) => {
      const isCurrent = locale.lang === currentLocaleInfo.lang
        && locale.country === currentLocaleInfo.country;
      const localeKey = `${locale.lang}-${locale.country}`;
      const fallbackUrl = locale.urlPath || `/${locale.lang}/${locale.country}/`;
      const mappedUrl = isCurrent ? null : (alternates[localeKey] || fallbackUrl);

      const option = createLocaleOption(locale, isCurrent, placeholders, mappedUrl, config);
      languageList.appendChild(option);
    });
  }

  // Toggle functionality
  currentLanguageButton.addEventListener('click', () => {
    const isExpanded = currentLanguageButton.getAttribute('aria-expanded') === 'true';
    currentLanguageButton.setAttribute('aria-expanded', !isExpanded);
    container.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', (event) => {
    if (!container.contains(event.target)) {
      currentLanguageButton.setAttribute('aria-expanded', 'false');
      container.classList.remove('open');
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && container.classList.contains('open')) {
      currentLanguageButton.setAttribute('aria-expanded', 'false');
      container.classList.remove('open');
      currentLanguageButton.focus();
    }
  });

  container.appendChild(currentLanguageButton);
  container.appendChild(languageList);

  block.textContent = '';
  block.appendChild(container);

  // Mark block as decorated to prevent duplicates
  block.dataset.decorated = 'true';
}
