# Multilingual Setup Guide for Franklin Edge Delivery Services

## Overview

This guide explains how to set up and manage a multilingual website using Franklin Edge Delivery Services with Google Drive as the document-based authoring system.

## Architecture

The multilingual setup follows a language-first approach:

```
https://comwrap.com/en/
https://comwrap.com/de/
https://comwrap.com/fr/
https://comwrap.com/it/
https://comwrap.com/pl/
```

## Folder Structure in Google Drive

Each language has its own folder containing:

```
/en/
  ├── index (homepage)
  ├── nav (navigation)
  ├── footer (footer)
  ├── placeholders (translations spreadsheet)
  └── query-index (content index spreadsheet)
  
/de/
  ├── index
  ├── nav
  ├── footer
  ├── placeholders
  └── query-index

... (same structure for fr, it, pl)
```

## Key Components

### 1. Language Switcher

The language switcher is automatically integrated into the header navigation and:
- Displays the current language
- Shows available languages in their native names
- Preserves the current page path when switching languages
- Stores user preference in localStorage

### 2. Placeholders System

Each language folder contains a `placeholders` spreadsheet with translations:

| Key | Text |
|-----|------|
| selectLanguage | Select language |
| languageEN | English |
| languageDE | Deutsch |
| languageFR | Français |
| languageIT | Italiano |
| languagePL | Polski |
| ... | ... |

### 3. Navigation and Footer

- Each language has its own `nav` and `footer` documents
- These are automatically loaded based on the current language
- Links are preserved within the language context

### 4. Content Indexing

Each language folder has a `query-index` spreadsheet that indexes content for that language, enabling:
- Language-specific search
- Dynamic content blocks
- SEO optimization

## Setting Up a New Language

1. **Create Language Folder**
   - Create a new folder in Google Drive (e.g., `/es/` for Spanish)

2. **Create Required Documents**
   - Copy `index`, `nav`, and `footer` from an existing language
   - Translate the content

3. **Create Placeholders Spreadsheet**
   - Copy the placeholders spreadsheet structure
   - Add translations for all keys

4. **Create Query Index**
   - Create a `query-index` spreadsheet
   - It will be populated automatically as content is published

5. **Update Configuration**
   - Add the language to `SUPPORTED_LANGUAGES` in `scripts/scripts.js`
   - Add the language to `LANGUAGES` array in `language-switcher.js`
   - Update `helix-sitemap.yaml` with the new language

## Language Detection and Redirection

The system handles language detection in the following order:

1. **URL Path**: If the URL contains a language code (e.g., `/de/`), that language is used
2. **Stored Preference**: Checks localStorage for previously selected language
3. **Browser Language**: Uses the browser's language setting if supported
4. **Default**: Falls back to English

On the homepage (`/`), users are automatically redirected to their preferred language.

## SEO Configuration

The `helix-sitemap.yaml` is configured to generate language-specific sitemaps with hreflang support:

```yaml
sitemaps:
  default:
    origin: https://comwrap.com
    languages:
      en:
        source: /en/query-index.json
        destination: /sitemap-en.xml
        hreflang: en
      de:
        source: /de/query-index.json
        destination: /sitemap-de.xml
        hreflang: de
        alternate: /de/{path}
```

## Best Practices

1. **Content Organization**
   - Keep language-specific content in respective folders
   - Share assets (images, videos) across languages when possible

2. **Translation Management**
   - Use consistent placeholder keys across all languages
   - Maintain translation spreadsheets regularly
   - Consider using translation memory tools

3. **Link Management**
   - Always use relative links within content
   - The system automatically adjusts links to stay within the current language

4. **Testing**
   - Test language switching on various pages
   - Verify SEO tags and hreflang attributes
   - Check fallback behavior for missing translations

## Troubleshooting

### Language Switcher Not Appearing
- Ensure the header block is loading correctly
- Check browser console for JavaScript errors
- Verify language folders exist in Google Drive

### Wrong Language Displayed
- Clear localStorage to reset language preference
- Check URL structure matches expected pattern
- Verify language detection logic in scripts.js

### Missing Translations
- Check placeholders spreadsheet for the specific language
- Ensure placeholders are published
- Verify fetchPlaceholders is called with correct language code

## Future Enhancements

- Regional content support (e.g., `/en/us/`, `/en/uk/`)
- RTL language support
- Automatic translation integration
- Language-specific asset management 