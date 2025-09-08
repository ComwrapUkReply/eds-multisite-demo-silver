## Multilingual Multisite Runbook (Language + Country)

Goal: Enable locales with both language and country segments in the URL, e.g. en/uk, ch/de, ch/fr, on top of the current multisite setup and Adobe Universal Editor authoring.

References:
- Gold brand site (for visual verification): https://main--eds-multisite-demo-gold--comwrapukreply.aem.page/
- Silver brand site: https://main--eds-multisite-demo-silver--comwrapukreply.aem.page/
- Multisite config inspiration: https://github.com/techdivision/eds-multisite-demo-main/blob/main/.multisite/config.yaml

### 1) Locale Model and URL Policy

- Locale is two segments at the start of the path:
  - language + country (e.g., en/uk), or
  - country + language (e.g., ch/de, ch/fr)
- We will allow both orders but control which countries are "country-first" via config.
- Allowed languages: en, de, fr, it, pl (extendable).
- Allowed countries: uk, ch, us, de, fr, it, pl (extendable).

Decision switches (in code config):
- countryFirstLocales: ["ch"] → paths beginning with "/ch/" expect second segment as language.
- defaultOrder: language-first when not in countryFirstLocales.

Examples that must resolve:
- /en/uk/..., /de/ch/..., /fr/ch/...
- /ch/de/..., /ch/fr/...

### 2) Content Structure (Universal Editor)

Organize content in per-locale folders under the site root:

- /en/uk/
- /de/ch/
- /fr/ch/

Authoring guidance:
- Each locale folder contains its own index, nav, footer, placeholders, and query-index (if used).
- Shared assets can remain in global folders; link relatively.

### 3) Language Switcher Behavior

Requirements:
- Detect current locale from URL (two segments).
- Build alternate URLs for the same page in other locales.
- If a page mapping is missing, fallback to that locale homepage.
- Preserve path where mappings exist.

Mapping sources (in order):
1. Google Sheet (recommended) mounted via fstab: /url-mappings
2. JSON fallback at /config/url-mappings.json
3. Heuristics: replace locale prefix and keep the remainder; if missing target, fallback to locale homepage.

### 4) URL Mapping Sheet (Recommended)

fstab.yaml additions (example):
```yaml
mountpoints:
  /: https://drive.google.com/drive/folders/YOUR_FOLDER_ID
  /url-mappings: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit#gid=0
```

Sheet columns (example):
| sourceLocale | sourcePath | targetLocale | targetPath | note |
|--------------|------------|--------------|------------|------|
| en-uk | /en/uk/who-we-are | de-ch | /de/ch/wer-wir-sind | about page |
| de-ch | /de/ch/wer-wir-sind | en-uk | /en/uk/who-we-are | about page |

Conventions:
- sourceLocale and targetLocale are hyphenated (en-uk, de-ch) in the sheet; the website path uses slashes (/en/uk/, /de/ch/).

### 5) JSON Fallback (Optional)

File: /config/url-mappings.json
```json
{
  "en-uk": {
    "/en/uk/who-we-are": "/de/ch/wer-wir-sind"
  },
  "de-ch": {
    "/de/ch/wer-wir-sind": "/en/uk/who-we-are"
  }
}
```

### 6) Scripts Overview

Add scripts/language-config.js
- Export:
  - allowedLanguages: ["en","de","fr","it","pl"]
  - allowedCountries: ["uk","ch","us","de","fr","it","pl"]
  - countryFirstLocales: ["ch"]

Add scripts/language-mapping.js
- parseLocale(path): returns { order: "lang-country" | "country-lang", lang, country, remainder }
- toLocalePrefix(lang, country, order): returns "/en/uk" or "/ch/de"
- localeToKey(lang, country): returns "en-uk"
- loadMappings(): tries Google Sheet JSON first, then /config/url-mappings.json, else empty
- mapUrlToLanguage(currentPath, targetLang, targetCountry?): returns mapped URL or homepage fallback
- getAlternates(currentPath): returns { "en-uk": "/en/uk/...", "de-ch": "/de/ch/..." }

Integrate with blocks/language-switcher/language-switcher.js
- Use parseLocale(...) to detect current.
- Populate the list from a configured locales array, e.g., ["en-uk","de-ch","fr-ch"].
- For each target locale, call mapUrlToLanguage to build the href.

### 7) SEO: hreflang and Sitemaps

helix-sitemap.yaml (example):
```yaml
sitemaps:
  default:
    origin: https://example.com
    lastmod: YYYY-MM-DD
    languages:
      en-uk:
        source: /en/uk/query-index.json
        destination: /sitemap-en-uk.xml
        hreflang: en-GB
        alternate: /en/uk/{path}
      de-ch:
        source: /de/ch/query-index.json
        destination: /sitemap-de-ch.xml
        hreflang: de-CH
        alternate: /de/ch/{path}
      fr-ch:
        source: /fr/ch/query-index.json
        destination: /sitemap-fr-ch.xml
        hreflang: fr-CH
        alternate: /fr/ch/{path}
```

In head/meta injection:
- For each page, add rel=alternate entries for every supported locale (hreflang en-GB, de-CH, fr-CH, plus x-default).
- Set <html lang="..."> to the current locale language (e.g., lang="en-GB").

### 8) Placeholders and Translations

- Maintain placeholders per locale folder: /en/uk/placeholders, /de/ch/placeholders, etc.
- Keys should include language names for the language switcher, e.g., languageEN_GB, languageDE_CH, languageFR_CH (or simple language names; UI labels can be generic while URL mapping is locale-specific).

### 9) Verification Steps

Manual checks:
- Visit brand pages and confirm locale prefixes and theming are correct:
  - Gold: https://main--eds-multisite-demo-gold--comwrapukreply.aem.page/
  - Silver: https://main--eds-multisite-demo-silver--comwrapukreply.aem.page/
- Test the language switcher on a subpage; ensure alternates resolve or fallback to the locale homepage.

Automated (optional):
- Add a workflow to curl /styles/theme.css and some known pages for each locale and assert 200 + expected tokens.

### 10) Rollout Plan

1. Define supported locales (e.g., en-uk, de-ch, fr-ch) in language-config.js.
2. Create locale folders and seed index, nav, footer, placeholders.
3. Update helix-sitemap.yaml to add locale sections and hreflang values.
4. Implement language-mapping.js with sheet + JSON fallback and heuristics.
5. Extend language-switcher to list locales and use mapUrlToLanguage.
6. QA: manual + automated checks; verify alternates and hreflang.
7. Communicate authoring guidelines to content team.

### 11) Authoring Guidelines (Universal Editor)

- Create content under the appropriate locale root. Keep URLs stable.
- For cross-locale equivalents, ensure a row exists in the URL mapping sheet.
- Use relative links; do not hardcode domain or other locale prefixes.
- Keep navigation documents per locale; avoid mixing links across locales unless intentional.

### 12) Notes on Multisite Interaction

- Multisite sync remains unchanged. Each brand can choose its own set of supported locales and their theme variables in /styles/theme.css.
- If brands differ in locale list, the language-switcher for that brand should be configured to list only its locales.


