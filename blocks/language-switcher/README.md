# Language Switcher Block

A multilingual country/language switcher component that supports complex locale structures like Switzerland (CH/DE, CH/FR) and other country-language combinations.

## Features

- Dropdown interface with current locale display (language/country)
- Country flags and native language names
- Support for country-first URLs (ch/de, ch/fr) and language-first URLs (en/uk)
- Country grouping for countries with multiple languages
- Keyboard navigation support
- Accessibility compliant (ARIA labels and roles)
- Automatic locale detection from URL
- JSON configuration for easy customization
- URL mapping with Google Sheets and JSON fallback
- Responsive design
- Integration with Franklin placeholders system

## Usage

The language switcher is automatically integrated into the header navigation. It can also be used standalone:

```
| language-switcher |
|-------------------|
```

## Configuration

The block supports two levels of configuration:

### 1. Block Definition (`_language-switcher.json`)
Used by Universal Editor for authoring interface and block properties:
- **Display Mode**: Dropdown, Compact, or Full List
- **Show Country Flags**: Enable/disable flag display
- **Group by Country**: Group languages under country headers
- **Supported Locales**: Which locales to show in the switcher
- **Fallback Locale**: Default locale for missing pages
- **Preserve Path**: Keep current page path when switching
- **Auto-detect**: Automatically detect user's preferred language

### 2. Runtime Configuration (`language-switcher.json`)
Defines available countries, languages, and behavior:

### Supported Locales
- English (UK): en/uk → en-GB
- English (US): en/us → en-US  
- German (Switzerland): ch/de → de-CH
- French (Switzerland): ch/fr → fr-CH
- Italian (Switzerland): ch/it → it-CH
- German (Germany): de/de → de-DE
- French (France): fr/fr → fr-FR
- Italian (Italy): it/it → it-IT
- Polish (Poland): pl/pl → pl-PL

### JSON Configuration Options
- **countries**: Define countries and their supported languages
- **display**: Control flags, grouping, and visual options
- **fallbacks**: Set default behaviors and error handling
- **ui**: Customize labels and accessibility features
- **behavior**: Configure URL preservation, auto-detection
- **mapping**: Set up URL mapping sources (Google Sheets, JSON)

### Block Usage in Universal Editor
When adding the language-switcher block in Universal Editor, you can configure:

| Property | Options | Default |
|----------|---------|---------|
| Display Mode | dropdown, compact, full | dropdown |
| Show Country Flags | true/false | true |
| Group by Country | true/false | true |
| Supported Locales | en-uk, de-ch, fr-ch, etc. | en-uk, de-ch, fr-ch |
| Fallback Locale | Any supported locale | en-uk |
| Preserve Path | true/false | true |
| Auto-detect | true/false | true |

### Runtime Configuration Example
    {
      "countries": {
        "ch": {
          "name": "Switzerland",
          "flag": "🇨🇭",
          "urlPattern": "country-first",
          "languages": [
            {
              "code": "de",
              "name": "Deutsch", 
              "hreflang": "de-CH",
              "urlPath": "/ch/de"
            }
          ]
        }
      }
    }

## Placeholders

The block uses the following placeholder keys:
- `selectLanguage`: Aria label for the language selector button
- `availableLanguages`: Aria label for the language list
- `languageEN`: Display name for English
- `languageDE`: Display name for German
- `languageFR`: Display name for French
- `languageIT`: Display name for Italian
- `languagePL`: Display name for Polish

## Accessibility

- Full keyboard navigation support
- ARIA labels for screen readers
- Current language marked with `aria-current="page"`
- Language-specific `hreflang` and `lang` attributes
- Focus management on open/close

## Styling

The block provides CSS custom properties for theming:
- Uses site color variables
- Responsive breakpoints
- Hover and focus states
- Smooth transitions

## Technical Details

- Automatically detects current language from URL path
- Falls back to English if no language detected
- Preserves current page path when switching languages
- Stores language preference in localStorage 