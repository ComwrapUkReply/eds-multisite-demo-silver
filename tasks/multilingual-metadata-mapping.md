# Multilingual Metadata Mapping Guide

This guide explains how to use metadata fields to map pages across different languages in Franklin/AEM Edge Delivery Services with support for direct cross-language switching.

## Overview

Instead of maintaining a separate CSV or JSON file for URL mappings, you can use page metadata to define relationships between language versions directly in your content. The enhanced system supports **direct switching between any language pair** (e.g., French ↔ Polish, German ↔ Italian).

## Implementation Approach

### Using `primary-language-url` Metadata (Enhanced)

The system uses AEM's `primary-language-url` metadata field but with an enhanced lookup algorithm that finds all language equivalents in a single operation.

### How It Works

1. **English as the Primary Language**: All non-English pages point to their English equivalent
2. **Smart Discovery**: When switching languages, the system finds ALL language equivalents at once
3. **Direct Cross-Language Switching**: French → Polish, German → Italian, etc. work directly
4. **Performance Optimized**: Results are cached to avoid repeated API calls

### Cross-Language Switching Examples

✅ **French to Polish**: `/fr/qui-sommes-nous` → `/pl/kim-jestesmy`
✅ **German to Italian**: `/de/wer-wir-sind` → `/it/chi-siamo`  
✅ **Polish to French**: `/pl/kim-jestesmy` → `/fr/qui-sommes-nous`
✅ **Any language to English**: `/de/wer-wir-sind` → `/en/who-we-are`
✅ **English to any language**: `/en/who-we-are` → `/it/chi-siamo`

### Technical Implementation

When switching from Language A to Language B:

1. **Load current page metadata** from Language A's query-index
2. **Find the English equivalent** (primary-language-url or current path if English)
3. **Query all other language query-indexes** in parallel to find pages with matching primary-language-url
4. **Cache results** for performance
5. **Return direct URL** for Language B

### Setup Steps

#### 1. Add Metadata to Non-English Pages

In your Google Docs/Word documents for non-English pages, add metadata:

**German Page Example** (`/de/wer-wir-sind`):
```
---
title: Wer wir sind
description: Über Comwrap Reply
primary-language-url: /en/who-we-are
---
```

**French Page Example** (`/fr/qui-sommes-nous`):
```
---
title: Qui sommes-nous
description: À propos de Comwrap Reply
primary-language-url: /en/who-we-are
---
```

**Italian Page Example** (`/it/chi-siamo`):
```
---
title: Chi siamo
description: Su Comwrap Reply
primary-language-url: /en/who-we-are
---
```

**Polish Page Example** (`/pl/kim-jestesmy`):
```
---
title: Kim jesteśmy
description: O Comwrap Reply
primary-language-url: /en/who-we-are
---
```

#### 2. Query Index Configuration

The `helix-query.yaml` file includes the `primary-language-url` field in the query index:

```yaml
primary-language-url:
  select: head > meta[name="primary-language-url"]
  value: attribute(el, "content")
```

#### 3. Enhanced Language Switcher Logic

The system automatically:
1. **Discovers all language equivalents** when first accessed
2. **Caches the mapping** for performance
3. **Provides direct switching** between any language pair

## Performance Benefits

- **Single Lookup**: All language equivalents found in one operation
- **Parallel Queries**: Multiple language query-indexes fetched simultaneously  
- **Intelligent Caching**: Results cached to avoid repeated API calls
- **Direct Switching**: No intermediate lookups required

## Alternative Approaches

### Option 1: Multiple Language URLs in Metadata

Instead of just `primary-language-url`, you could add specific language URLs:

```
---
title: Who we are
german-url: /de/wer-wir-sind
french-url: /fr/qui-sommes-nous
italian-url: /it/chi-siamo
polish-url: /pl/kim-jestesmy
---
```

**Pros**: Direct mapping, no lookup needed
**Cons**: More metadata to maintain, duplicated information across all pages

### Option 2: Master Mapping Document

Create a single document (e.g., `/language-mappings`) that contains all mappings:

```
| English URL | German URL | French URL | Italian URL | Polish URL |
|-------------|------------|------------|-------------|------------|
| /en/who-we-are | /de/wer-wir-sind | /fr/qui-sommes-nous | /it/chi-siamo | /pl/kim-jestesmy |
| /en/what-we-do | /de/was-wir-tun | /fr/ce-que-nous-faisons | /it/cosa-facciamo | /pl/co-robimy |
```

**Pros**: All mappings in one place
**Cons**: Separate from content, needs manual updates

## Recommended Approach

Use the **enhanced `primary-language-url` metadata** approach because:

1. **Supports All Language Pairs**: Direct French ↔ Polish, German ↔ Italian switching
2. **AEM Compatible**: Uses official AEM metadata standards
3. **Content-driven**: Mappings live with the content
4. **Performance Optimized**: Caching and parallel queries
5. **Scalable**: Works well as you add more pages and languages
6. **SEO-friendly**: Helps with hreflang generation for sitemaps

## Workflow for Content Authors

1. **Create English page first** (e.g., `/en/new-page`)
2. **Create translated versions** with metadata pointing to English:
   - German: Add `primary-language-url: /en/new-page`
   - French: Add `primary-language-url: /en/new-page`
   - Italian: Add `primary-language-url: /en/new-page`
   - Polish: Add `primary-language-url: /en/new-page`
3. **Publish all versions**
4. **Language switcher automatically works** for ALL language combinations!

## Benefits

- ✅ **Direct cross-language switching** (French → Polish, German → Italian, etc.)
- ✅ **No separate mapping files** to maintain
- ✅ **Content authors control** the relationships
- ✅ **Performance optimized** with caching
- ✅ **Works with AEM's built-in features**
- ✅ **Automatic sitemap hreflang support**
- ✅ **Easy to understand and implement**
- ✅ **Scales to any number of languages** 