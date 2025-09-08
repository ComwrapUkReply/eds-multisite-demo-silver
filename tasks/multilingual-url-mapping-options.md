# Multilingual URL Mapping Options

## Overview

You have several options for managing URL mappings between different languages. Here's a comparison of all available approaches:

## Option 1: Google Sheets (Recommended) 🌟

### ✅ Pros
- **User-friendly**: Content authors can manage without technical knowledge
- **Real-time collaboration**: Multiple people can edit simultaneously
- **Version history**: Google Sheets tracks all changes
- **Visual management**: See all mappings in spreadsheet format
- **Bulk operations**: Easy to add/edit many mappings at once
- **No deployment needed**: Changes are live after publishing
- **Familiar interface**: Most content authors know Google Sheets

### ❌ Cons
- **Requires Google Drive setup**: Need to configure fstab.yaml
- **Internet dependency**: Requires online access to edit
- **Franklin dependency**: Relies on Franklin's sheet publishing

### Setup Steps
1. Create Google Sheets document named `url-mappings`
2. Add to fstab.yaml: `/url-mappings: https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=0`
3. Import template from `/config/url-mappings-template.csv`
4. Publish using Franklin Sidekick

### Example Sheet Structure
| Source Language | Source URL | Target Language | Target URL | Description |
|-----------------|------------|-----------------|------------|-------------|
| de | /de/wer-wir-sind | en | /en/who-we-are | About Us page |
| en | /en/who-we-are | de | /de/wer-wir-sind | About Us page |

---

## Option 2: JSON Configuration File

### ✅ Pros
- **Fast loading**: Direct JSON parsing
- **Version control**: Can be tracked in Git
- **No external dependencies**: Self-contained
- **Predictable**: Always available, no network issues

### ❌ Cons
- **Technical knowledge required**: JSON syntax can be tricky
- **Developer-dependent**: Content authors need developer help
- **Deployment required**: Changes need code deployment
- **Error-prone**: Easy to break JSON syntax
- **No collaboration**: Only one person can edit at a time

### Setup Steps
1. Edit `/config/url-mappings.json`
2. Deploy changes to website
3. No additional configuration needed

### Example JSON Structure
```json
{
  "de-to-en": {
    "/de/wer-wir-sind": "/en/who-we-are"
  },
  "en-to-de": {
    "/en/who-we-are": "/de/wer-wir-sind"
  }
}
```

---

## Option 3: Automatic/Intelligent Mapping

### ✅ Pros
- **No manual setup**: Works automatically
- **Zero maintenance**: No need to manage mappings
- **Always works**: Never breaks due to configuration errors

### ❌ Cons
- **Limited accuracy**: May not find correct equivalent pages
- **No custom logic**: Can't handle special cases
- **SEO impact**: May redirect to non-existent pages (404s)
- **User experience**: Users might land on wrong pages

### How It Works
The system automatically tries these approaches:
1. **Simple prefix replacement**: `/de/page` → `/en/page`
2. **Homepage fallback**: Unknown pages redirect to language homepage
3. **English bridge**: Non-English to non-English via English

---

## Option 4: Hybrid Approach (Best of Both Worlds)

### ✅ Pros
- **Reliability**: Google Sheets primary, JSON fallback
- **Flexibility**: Can use both approaches as needed
- **Gradual migration**: Can move from JSON to Sheets over time
- **Fault tolerance**: If one fails, the other works

### ❌ Cons
- **Complexity**: Need to maintain both systems
- **Potential conflicts**: Same mapping in both sources
- **More setup**: Requires configuring both approaches

### How It Works
1. **Primary**: Load from Google Sheets
2. **Fallback**: Load from JSON if Sheets fails
3. **Final fallback**: Automatic mapping logic

---

## Recommendation Matrix

| Use Case | Recommended Option | Why |
|----------|-------------------|-----|
| **Content team manages URLs** | Google Sheets | Easy for non-technical users |
| **Developer-only team** | JSON Configuration | Full control, version tracking |
| **Small site (<10 pages)** | Automatic Mapping | Minimal setup required |
| **Large enterprise site** | Hybrid Approach | Maximum reliability |
| **Frequent URL changes** | Google Sheets | Easy to update without deployment |
| **Static URL structure** | JSON Configuration | Set once, never changes |

---

## Implementation Guide

### For Google Sheets (Recommended)

1. **Create the sheet** following the [Google Sheets guide](./google-sheets-url-mapping.md)
2. **Update fstab.yaml**:
```yaml
mountpoints:
  /: https://drive.google.com/drive/folders/YOUR_MAIN_FOLDER_ID
  /url-mappings: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit#gid=0
```
3. **Import template data** from `/config/url-mappings-template.csv`
4. **Publish and test**

### For JSON Configuration

1. **Edit `/config/url-mappings.json`** with your mappings
2. **Deploy to your site**
3. **Test language switching**

### For Hybrid Approach

1. **Set up Google Sheets** as above
2. **Keep JSON file** as backup
3. **System automatically uses both** (Sheets first, JSON fallback)

---

## Migration Paths

### From JSON to Google Sheets

1. **Create Google Sheet** with same structure
2. **Convert JSON data** to spreadsheet format
3. **Test thoroughly** before removing JSON
4. **Keep JSON as fallback** (recommended)

### From Manual to Automatic

1. **Remove configuration files**
2. **Test automatic behavior**
3. **Add manual mappings** only for special cases

### From Automatic to Managed

1. **Identify current URL patterns**
2. **Create mappings** for existing pages
3. **Set up chosen system** (Sheets or JSON)
4. **Test all language switches**

---

## Best Practices

### Regardless of Option

1. **Always create bidirectional mappings**
2. **Include homepage mappings**
3. **Test after every change**
4. **Document your approach** for team members
5. **Monitor 404 errors** from language switching

### For Google Sheets

1. **Use consistent formatting**
2. **Add descriptions** for clarity
3. **Sort by source language** for organization
4. **Regular backups** (export to CSV)

### For JSON

1. **Validate JSON syntax** before deployment
2. **Use version control** for change tracking
3. **Comment your mappings** where possible
4. **Test in staging** before production

---

## Troubleshooting

### Common Issues

1. **Language switcher goes to 404**
   - Check mapping exists for current page
   - Verify target page actually exists
   - Check for typos in URLs

2. **Mappings not loading**
   - Google Sheets: Check if published, verify fstab.yaml
   - JSON: Check file exists, validate syntax
   - Check browser console for errors

3. **Changes not reflected**
   - Google Sheets: Re-publish using Sidekick
   - JSON: Clear browser cache, redeploy
   - Check if mapping is bidirectional

### Debug Tools

```javascript
// Check current mappings
import('/scripts/language-mapping.js').then(module => {
  console.log('Current mappings:', module.getCurrentMappings());
});

// Test a specific mapping
import { mapUrlToLanguage } from '/scripts/language-mapping.js';
console.log('German equivalent:', mapUrlToLanguage('/en/who-we-are', 'de'));
```

---

## Conclusion

**For most teams, we recommend the Google Sheets approach** because:

1. **Content authors can manage it independently**
2. **Changes are immediate** (no deployment needed)
3. **It's visual and intuitive**
4. **Collaboration is built-in**
5. **Version history is automatic**

The hybrid approach (Google Sheets + JSON fallback) provides the best reliability for enterprise websites, while the JSON-only approach works well for developer-managed sites with stable URL structures. 