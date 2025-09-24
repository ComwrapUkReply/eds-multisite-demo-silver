/**
 * Copyright 2025 Adobe
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy at
 *   http://www.apache.org/licenses/LICENSE-2.0
 */

/* eslint-env browser */
/* global WebImporter */

/* ---------------------------
   Constants
---------------------------- */

const KNOWN_TAGS = [
  'div', 'section', 'img', 'a', 'button', 'p',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span',
  'input', 'ol', 'li', 'ul', 'summary', 'details',
];

// Enhanced class hints for all block types
const CLASS_HINTS = {
  teaser: [
    'teaser', 'cmp-teaser', 'hero-teaser', 'promo',
    'tile', 'lead', 'card--teaser', 'content-card',
  ],
  hero: [
    'hero', 'banner', 'jumbotron', 'hero-section',
    'main-banner', 'hero-banner', 'landing-hero',
  ],
  quote: [
    'quote', 'testimonial', 'blockquote', 'citation',
    'quote-block', 'testimonial-block', 'pullquote',
  ],
  cards: [
    'cards', 'card-grid', 'card-container', 'grid',
    'card-list', 'feature-cards', 'product-cards',
  ],
  card: [
    'card', 'card-item', 'grid-item', 'feature-card',
    'product-card', 'content-card', 'tile',
  ],
  columns: [
    'columns', 'column-layout', 'multi-column', 'grid-layout',
    'two-column', 'three-column', 'layout-grid',
  ],
  fragment: [
    'fragment', 'include', 'reference', 'embed',
    'content-fragment', 'fragment-block',
  ],
  'language-switcher': [
    'language-switcher', 'lang-switcher', 'locale-switcher',
    'language-selector', 'multilingual', 'i18n-switcher',
  ],
};

/* ---------------------------
   Small utils
---------------------------- */

function containsOnlyText(element) {
  const { childNodes } = element;
  for (let i = 0; i < childNodes.length; i += 1) {
    if (childNodes[i].nodeType !== Node.TEXT_NODE) return false;
  }
  return true;
}

function hasAnyClass(node, names) {
  try {
    return node?.classList && names.some((n) => node.classList.contains(n));
  } catch {
    return false;
  }
}

function firstImg(kids) {
  if (!kids) return undefined;
  for (const k of kids) if (k?.type === 'img') return k;
  return undefined;
}

function firstHeading(kids) {
  if (!kids) return undefined;
  for (const k of kids) {
    const tag = (k.tag || '').toLowerCase();
    if (k.type === 'text' && (tag === 'h1' || tag === 'h2' || tag === 'h3')) return k;
  }
  return undefined;
}

function allParas(kids) {
  if (!kids) return [];
  const out = [];
  for (const k of kids) {
    if (k.type === 'text' && (!k.tag || k.tag === 'p')) out.push(k);
  }
  return out;
}

function firstCta(kids) {
  if (!kids) return undefined;
  for (const k of kids) if (k?.type === 'cta' || k?.type === 'link') return k;
  return undefined;
}

function flattenTexts(kids) {
  if (!kids) return [];
  const out = [];
  for (const k of kids) {
    if (k?.type === 'text' && Array.isArray(k.elements) && k.elements.length > 0) {
      for (const e of k.elements) out.push(e);
    } else {
      out.push(k);
    }
  }
  return out;
}

/* ---------------------------
   CSS helpers
---------------------------- */

function getStylesFromStylesheets(node) {
  const styles = {};
  const { styleSheets } = document;
  for (let i = 0; i < styleSheets.length; i += 1) {
    const sheet = styleSheets[i];
    try {
      const rules = sheet.cssRules || [];
      for (let j = 0; j < rules.length; j += 1) {
        const rule = rules[j];
        if (rule.selectorText && node.matches(rule.selectorText)) {
          Object.assign(styles, rule.style);
        }
      }
    } catch {
      // cross-origin, ignore
    }
  }
  return styles;
}

function getBackgroundImage(node) {
  let bg = node.style.backgroundImage;
  if (!bg || bg === 'none') bg = window.getComputedStyle(node).backgroundImage;
  if (!bg || bg === 'none') {
    const styles = getStylesFromStylesheets(node);
    bg = styles.backgroundImage;
  }
  if (bg && bg !== 'none') {
    const m = bg.match(/url\(["']?([^"']*)["']?\)/);
    return m ? m[1] : null;
  }
  return null;
}

async function fetchCSS(url) {
  try {
    const res = await fetch(url);
    return res.text();
  } catch {
    return '';
  }
}

function applyCSSToDocument(cssText, documentRef) {
  if (!cssText) return;
  const styleEl = documentRef.createElement('style');
  styleEl.textContent = cssText;
  documentRef.head.appendChild(styleEl);
}

function extractCSSUrls(documentRef) {
  const links = Array.from(documentRef.querySelectorAll('link[rel="stylesheet"]'));
  return links.map((l) => l.href);
}

async function loadAndApplyCSS(urls, documentRef) {
  const jobs = urls.map(async (u) => {
    const css = await fetchCSS(u);
    applyCSSToDocument(css, documentRef);
  });
  await Promise.all(jobs);
}

/* ---------------------------
   Block pattern detection
---------------------------- */

/**
 * Detects if a node matches the Hero block pattern
 * Hero blocks typically have: background image + text content, or large heading + description
 */
function possibleHero(node) {
  if (!node?.children || node.children.length < 1) return false;

  const kids = flattenTexts(node.children);
  const img = firstImg(kids) || (node.backgroundImage ? { type: 'img', link: node.backgroundImage } : null);
  const heading = firstHeading(kids);
  const hasDesc = allParas(kids).length > 0;
  const hasClassHint = hasAnyClass(node, CLASS_HINTS.hero);

  // Pattern 1: Large background image with text overlay
  const hasBackgroundImageAndContent = node.backgroundImage && (heading || hasDesc);

  // Pattern 2: Large heading with description (typical hero pattern)
  const hasLargeHeading = heading && (heading.tag === 'h1' || heading.tag === 'h2') && hasDesc;

  // Pattern 3: Image + large heading
  const hasImageAndHeading = img && heading && (heading.tag === 'h1' || heading.tag === 'h2');

  // Pattern 4: CSS class hint
  const hasHeroClass = hasClassHint;

  return Boolean(hasBackgroundImageAndContent || hasLargeHeading || hasImageAndHeading || hasHeroClass);
}

/**
 * Detects if a node matches the Quote block pattern
 * Quote blocks typically have: quoted text + author attribution
 */
function possibleQuote(node) {
  if (!node?.children || node.children.length < 1) return false;

  const kids = flattenTexts(node.children);
  const hasClassHint = hasAnyClass(node, CLASS_HINTS.quote);

  // Look for blockquote elements or text that looks like a quote
  const hasBlockquote = kids.some((k) => k.tag === 'blockquote');
  const hasQuoteText = kids.some((k) => (
    k.type === 'text'
    && (k.text?.includes('"') || k.text?.includes('"') || k.text?.includes("'") || k.text?.includes("'"))
  ));

  // Pattern 1: Blockquote element
  const hasBlockquotePattern = hasBlockquote;

  // Pattern 2: Text with quotes + potential author
  const hasQuotePattern = hasQuoteText && kids.length >= 2;

  // Pattern 3: CSS class hint
  const hasQuoteClass = hasClassHint;

  return Boolean(hasBlockquotePattern || hasQuotePattern || hasQuoteClass);
}

/**
 * Detects if a node matches the Cards container pattern
 * Cards containers typically have multiple similar child elements
 */
function possibleCards(node) {
  if (!node?.children || node.children.length < 2) return false;

  const hasClassHint = hasAnyClass(node, CLASS_HINTS.cards);

  // Look for multiple similar child elements that could be cards
  const hasMultipleSimilarChildren = node.children.length >= 2;

  // Check if children have similar structure (image + text patterns)
  const childrenWithImages = node.children.filter((child) => {
    const childKids = flattenTexts(child.children || []);
    return firstImg(childKids) || child.backgroundImage;
  });

  const hasMultipleCards = childrenWithImages.length >= 2;

  return Boolean(hasClassHint || (hasMultipleSimilarChildren && hasMultipleCards));
}

/**
 * Detects if a node matches the Columns pattern
 * Columns typically have multiple child elements arranged horizontally
 */
function possibleColumns(node) {
  if (!node?.children || node.children.length < 2) return false;

  const hasClassHint = hasAnyClass(node, CLASS_HINTS.columns);

  // Look for multiple child elements that could be columns
  const hasMultipleChildren = node.children.length >= 2;

  // Check if children have similar structure
  const hasSimilarChildren = node.children.every((child) => (
    child.children && child.children.length > 0
  ));

  return Boolean(hasClassHint || (hasMultipleChildren && hasSimilarChildren));
}

/**
 * Detects if a node matches the Fragment pattern
 * Fragments typically reference external content
 */
function possibleFragment(node) {
  if (!node?.children || node.children.length < 1) return false;

  const kids = flattenTexts(node.children);
  const hasClassHint = hasAnyClass(node, CLASS_HINTS.fragment);

  // Look for iframe elements or content that suggests external reference
  const hasIframe = kids.some((k) => k.type === 'iframe');
  const hasExternalContent = kids.some((k) => (
    k.type === 'link' && k.link && !k.link.startsWith('#')
  ));

  return Boolean(hasClassHint || hasIframe || hasExternalContent);
}

/**
 * Detects if a node matches the Language Switcher pattern
 * Language switchers typically have dropdown or link elements for language selection
 */
function possibleLanguageSwitcher(node) {
  if (!node?.children || node.children.length < 1) return false;

  const kids = flattenTexts(node.children);
  const hasClassHint = hasAnyClass(node, CLASS_HINTS['language-switcher']);

  // Look for language-related content
  const hasLanguageLinks = kids.some((k) => (
    k.type === 'link'
    && (k.text?.toLowerCase().includes('language')
      || k.text?.toLowerCase().includes('lang')
      || k.link?.includes('lang=')
      || k.link?.includes('locale='))
  ));

  const hasSelectElement = kids.some((k) => k.type === 'select');
  const hasLanguageText = kids.some((k) => (
    k.type === 'text'
    && (k.text?.toLowerCase().includes('language')
      || k.text?.toLowerCase().includes('select language'))
  ));

  return Boolean(hasClassHint || hasLanguageLinks || hasSelectElement || hasLanguageText);
}

/* ---------------------------
   Block HTML builders
---------------------------- */

function createHeroBlockHtml(main, node, fromParent) {
  const kids = flattenTexts(node.children || []);
  const imgNode = firstImg(kids) || (node.backgroundImage
    ? { type: 'img', link: node.backgroundImage }
    : null);
  const h = firstHeading(kids);
  const descs = allParas(kids);

  const cells = [['Hero']];

  // Image
  if (imgNode) {
    const imgCell = document.createElement('div');
    const img = document.createElement('img');
    img.src = imgNode.link;
    img.alt = imgNode.alt || '';
    img.setAttribute('data-aue-prop', 'image');
    img.setAttribute('data-aue-type', 'reference');
    imgCell.appendChild(img);
    cells.push([imgCell]);
  }

  // Image Alt
  if (imgNode?.alt) {
    const altCell = document.createElement('div');
    altCell.textContent = imgNode.alt;
    altCell.setAttribute('data-aue-prop', 'imageAlt');
    altCell.setAttribute('data-aue-type', 'text');
    cells.push([altCell]);
  }

  // Text content
  if (h || descs.length > 0) {
    const textCell = document.createElement('div');
    const textWrapper = document.createElement('div');
    textWrapper.setAttribute('data-aue-prop', 'text');
    textWrapper.setAttribute('data-aue-type', 'richtext');

    if (h) {
      const hEl = document.createElement(h.tag || 'h1');
      hEl.innerHTML = (h.text || '').replace(/<br\s*\/?>/gi, ' ');
      textWrapper.appendChild(hEl);
    }

    for (const p of descs) {
      const pEl = document.createElement('p');
      pEl.innerHTML = (p.text || '').replace(/<br\s*\/?>/gi, ' ');
      textWrapper.appendChild(pEl);
    }

    textCell.appendChild(textWrapper);
    cells.push([textCell]);
  }

  const table = WebImporter.DOMUtils.createTable(cells, document);
  if (!fromParent) main.appendChild(table);
  node.htmlModule = table;
}

function createQuoteBlockHtml(main, node, fromParent) {
  const kids = flattenTexts(node.children || []);
  const quoteText = kids.find((k) => k.tag === 'blockquote') || kids[0];
  const authorText = kids.find((k) => (
    k.type === 'text'
    && (k.text?.includes('—') || k.text?.includes('-') || k.text?.includes('by'))
  )) || kids[kids.length - 1];

  const cells = [['Quote']];

  // Quote text
  if (quoteText) {
    const quoteCell = document.createElement('div');
    const quoteWrapper = document.createElement('div');
    quoteWrapper.setAttribute('data-aue-prop', 'quote');
    quoteWrapper.setAttribute('data-aue-type', 'richtext');

    const quoteEl = document.createElement('blockquote');
    quoteEl.innerHTML = (quoteText.text || '').replace(/<br\s*\/?>/gi, ' ');
    quoteWrapper.appendChild(quoteEl);
    quoteCell.appendChild(quoteWrapper);
    cells.push([quoteCell]);
  }

  // Author
  if (authorText && authorText !== quoteText) {
    const authorCell = document.createElement('div');
    authorCell.textContent = authorText.text || '';
    authorCell.setAttribute('data-aue-prop', 'author');
    authorCell.setAttribute('data-aue-type', 'text');
    cells.push([authorCell]);
  }

  // Classes (default)
  const classesCell = document.createElement('div');
  classesCell.textContent = '';
  classesCell.setAttribute('data-aue-prop', 'classes');
  classesCell.setAttribute('data-aue-type', 'select');
  cells.push([classesCell]);

  const table = WebImporter.DOMUtils.createTable(cells, document);
  if (!fromParent) main.appendChild(table);
  node.htmlModule = table;
}

function createCardsBlockHtml(main, node, fromParent) {
  const cells = [['Cards']];

  // Process each child as a card
  for (const child of node.children) {
    const childKids = flattenTexts(child.children || []);
    const imgNode = firstImg(childKids) || (child.backgroundImage
      ? { type: 'img', link: child.backgroundImage }
      : null);
    const textContent = childKids.find((k) => k.type === 'text');

    if (imgNode || textContent) {
      const cardCell = document.createElement('div');
      cardCell.setAttribute('data-aue-prop', 'card');
      cardCell.setAttribute('data-aue-type', 'block');

      // Image
      if (imgNode) {
        const img = document.createElement('img');
        img.src = imgNode.link;
        img.alt = imgNode.alt || '';
        img.setAttribute('data-aue-prop', 'image');
        img.setAttribute('data-aue-type', 'reference');
        cardCell.appendChild(img);
      }

      // Text
      if (textContent) {
        const textDiv = document.createElement('div');
        textDiv.innerHTML = textContent.text || '';
        textDiv.setAttribute('data-aue-prop', 'text');
        textDiv.setAttribute('data-aue-type', 'richtext');
        cardCell.appendChild(textDiv);
      }

      cells.push([cardCell]);
    }
  }

  const table = WebImporter.DOMUtils.createTable(cells, document);
  if (!fromParent) main.appendChild(table);
  node.htmlModule = table;
}

function createColumnsBlockHtml(main, node, fromParent) {
  const cells = [['Columns']];

  // Columns count
  const columnsCell = document.createElement('div');
  columnsCell.textContent = node.children.length.toString();
  columnsCell.setAttribute('data-aue-prop', 'columns');
  columnsCell.setAttribute('data-aue-type', 'number');
  cells.push([columnsCell]);

  // Rows count (default to 1)
  const rowsCell = document.createElement('div');
  rowsCell.textContent = '1';
  rowsCell.setAttribute('data-aue-prop', 'rows');
  rowsCell.setAttribute('data-aue-type', 'number');
  cells.push([rowsCell]);

  // Column content
  for (const child of node.children) {
    const columnCell = document.createElement('div');
    columnCell.setAttribute('data-aue-prop', 'column');
    columnCell.setAttribute('data-aue-type', 'block');
    columnCell.innerHTML = child.innerHTML || '';
    cells.push([columnCell]);
  }

  const table = WebImporter.DOMUtils.createTable(cells, document);
  if (!fromParent) main.appendChild(table);
  node.htmlModule = table;
}

function createFragmentBlockHtml(main, node, fromParent) {
  const kids = flattenTexts(node.children || []);
  const linkNode = firstCta(kids) || kids.find((k) => k.type === 'link');

  const cells = [['Fragment']];

  // Reference
  const refCell = document.createElement('div');
  if (linkNode) {
    const link = document.createElement('a');
    link.href = linkNode.link || '#';
    link.textContent = linkNode.text || 'Reference';
    refCell.appendChild(link);
  } else {
    refCell.textContent = 'Reference';
  }
  refCell.setAttribute('data-aue-prop', 'reference');
  refCell.setAttribute('data-aue-type', 'aem-content');
  cells.push([refCell]);

  const table = WebImporter.DOMUtils.createTable(cells, document);
  if (!fromParent) main.appendChild(table);
  node.htmlModule = table;
}

function createLanguageSwitcherBlockHtml(main, node, fromParent) {
  const cells = [['Language Switcher']];

  // Title
  const titleCell = document.createElement('div');
  titleCell.textContent = 'Language Switcher';
  titleCell.setAttribute('data-aue-prop', 'title');
  titleCell.setAttribute('data-aue-type', 'text');
  cells.push([titleCell]);

  // Show Country Flags
  const flagsCell = document.createElement('div');
  flagsCell.textContent = 'true';
  flagsCell.setAttribute('data-aue-prop', 'showCountryFlags');
  flagsCell.setAttribute('data-aue-type', 'boolean');
  cells.push([flagsCell]);

  // Group by Country
  const groupCell = document.createElement('div');
  groupCell.textContent = 'true';
  groupCell.setAttribute('data-aue-prop', 'groupByCountry');
  groupCell.setAttribute('data-aue-type', 'boolean');
  cells.push([groupCell]);

  // Supported Locales
  const localesCell = document.createElement('div');
  localesCell.textContent = 'en-uk,de-ch,fr-ch';
  localesCell.setAttribute('data-aue-prop', 'supportedLocales');
  localesCell.setAttribute('data-aue-type', 'multiselect');
  cells.push([localesCell]);

  // Fallback Locale
  const fallbackCell = document.createElement('div');
  fallbackCell.textContent = 'en-uk';
  fallbackCell.setAttribute('data-aue-prop', 'fallbackLocale');
  fallbackCell.setAttribute('data-aue-type', 'select');
  cells.push([fallbackCell]);

  // Preserve Path
  const preserveCell = document.createElement('div');
  preserveCell.textContent = 'true';
  preserveCell.setAttribute('data-aue-prop', 'preservePath');
  preserveCell.setAttribute('data-aue-type', 'boolean');
  cells.push([preserveCell]);

  const table = WebImporter.DOMUtils.createTable(cells, document);
  if (!fromParent) main.appendChild(table);
  node.htmlModule = table;
}

// Keep the existing teaser function
function createTeaserBlockHtml(main, node, fromParent) {
  const kids = flattenTexts(node.children || []);
  const imgNode = firstImg(kids) || (node.backgroundImage
    ? { type: 'img', link: node.backgroundImage }
    : null);
  const h = firstHeading(kids);
  const descs = allParas(kids);
  const ctaNode = firstCta(kids);

  const cells = [['Teaser']];

  // Image
  if (imgNode) {
    const imgCell = document.createElement('div');
    const img = document.createElement('img');
    img.src = imgNode.link;
    img.alt = imgNode.alt || '';
    img.setAttribute('data-aue-prop', 'image');
    img.setAttribute('data-aue-type', 'reference');
    imgCell.appendChild(img);
    cells.push([imgCell]);
  }

  // Image Alt
  if (imgNode?.alt) {
    const altCell = document.createElement('div');
    altCell.textContent = imgNode.alt;
    altCell.setAttribute('data-aue-prop', 'imageAlt');
    altCell.setAttribute('data-aue-type', 'text');
    cells.push([altCell]);
  }

  // Title
  if (h) {
    const titleCell = document.createElement('div');
    const hEl = document.createElement(h.tag || 'h2');
    hEl.innerHTML = (h.text || '').replace(/<br\s*\/?>/gi, ' ');
    hEl.setAttribute('data-aue-prop', 'title');
    hEl.setAttribute('data-aue-type', 'richtext');
    titleCell.appendChild(hEl);
    cells.push([titleCell]);
  }

  // Description
  if (descs.length > 0) {
    const descCell = document.createElement('div');
    const descWrapper = document.createElement('div');
    descWrapper.setAttribute('data-aue-prop', 'description');
    descWrapper.setAttribute('data-aue-type', 'richtext');

    for (const p of descs) {
      const pEl = document.createElement('p');
      pEl.innerHTML = (p.text || '').replace(/<br\s*\/?>/gi, ' ');
      descWrapper.appendChild(pEl);
    }
    descCell.appendChild(descWrapper);
    cells.push([descCell]);
  }

  // Link
  if (ctaNode) {
    const linkCell = document.createElement('div');
    const linkWrapper = document.createElement('div');
    linkWrapper.setAttribute('data-aue-prop', 'link');
    linkWrapper.setAttribute('data-aue-type', 'aem-content');

    const a = document.createElement('a');
    a.href = ctaNode.link || '#';
    a.textContent = (ctaNode.text || '').trim() || 'Learn More';
    linkWrapper.appendChild(a);
    linkCell.appendChild(linkWrapper);
    cells.push([linkCell]);
  }

  // Link Text
  if (ctaNode) {
    const linkTextCell = document.createElement('div');
    linkTextCell.textContent = (ctaNode.text || '').trim() || 'Learn More';
    linkTextCell.setAttribute('data-aue-prop', 'linkText');
    linkTextCell.setAttribute('data-aue-type', 'text');
    cells.push([linkTextCell]);
  }

  // Variant
  const variantCell = document.createElement('div');
  variantCell.textContent = 'default';
  variantCell.setAttribute('data-aue-prop', 'variant');
  variantCell.setAttribute('data-aue-type', 'select');
  cells.push([variantCell]);

  const table = WebImporter.DOMUtils.createTable(cells, document);
  if (!fromParent) main.appendChild(table);
  node.htmlModule = table;
}

/* ---------------------------
   Enhanced block detection
---------------------------- */

function possibleTeaser(node) {
  if (!node?.children || node.children.length < 1) return false;

  const kids = flattenTexts(node.children);
  const img = firstImg(kids) || (node.backgroundImage ? { type: 'img', link: node.backgroundImage } : null);
  const heading = firstHeading(kids);
  const cta = firstCta(kids);
  const hasDesc = allParas(kids).length > 0;
  const hasClassHint = hasAnyClass(node, CLASS_HINTS.teaser);

  const hasImageAndContent = img && (heading || hasDesc);
  const hasHeadingAndCTA = heading && cta;
  const hasBackgroundImage = node.backgroundImage && (heading || hasDesc);
  const isSingleContent = node.children.length === 1 && (heading || hasDesc);
  const isTeaserImageTitleDescription = node.children.length === 1 && img && heading && hasDesc;
  const isTeaserImageTitleDescriptionCTA = node.children.length === 1 && img && img.alt && heading && hasDesc && cta;

  return Boolean(
    hasImageAndContent || hasHeadingAndCTA || hasClassHint || hasBackgroundImage || isSingleContent || isTeaserImageTitleDescription || isTeaserImageTitleDescriptionCTA,
  );
}

/* ---------------------------
   DOM → JSON
---------------------------- */

function transformTextNodeWithLink(node, documentRef) {
  const tag = node.nodeName?.toLowerCase();
  if (
    node.nodeType === Node.ELEMENT_NODE
    && ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'].includes(tag)
  ) {
    const linkChild = Array.from(node.childNodes)
      .find((c) => c.nodeName && c.nodeName.toLowerCase() === 'a');
    if (linkChild) {
      const a = documentRef.createElement('a');
      a.href = linkChild.href;
      a.innerText = linkChild.innerText || node.innerText;
      return a;
    }
  }
  return node;
}

function parseDOM(root) {
  const createNodeObject = (node) => {
    const doc = node.ownerDocument || document;
    const transformed = transformTextNodeWithLink(node, doc);
    const n = transformed;

    if (n.nodeType !== Node.ELEMENT_NODE) return null;

    let tagName = n.nodeName.toLowerCase();
    const style = window.getComputedStyle(n);

    if (style.display === 'none' || ['script', 'style', 'iframe', 'noscript'].includes(tagName)) {
      return null;
    }

    if (tagName === 'article' && containsOnlyText(n)) tagName = 'p';
    if (!KNOWN_TAGS.includes(tagName)) tagName = 'div';

    const obj = { type: tagName, children: [], classList: n.classList };
    let children = [];

    if (
      tagName === 'div'
      && n.childNodes
      && n.childNodes.length === 1
      && n.childNodes[0].nodeType === Node.TEXT_NODE
    ) {
      obj.text = n.innerHTML;
      obj.type = 'text';
      obj.tag = 'p';
    }

    if (tagName === 'ol' || tagName === 'ul') {
      obj.type = 'list';
      obj.tag = tagName;
    }

    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'li', 'summary'].includes(tagName)) {
      obj.text = n.innerHTML;
      obj.type = 'text';
      obj.tag = tagName;
    } else {
      const tmp = [];
      for (const cn of Array.from(n.childNodes)) {
        const res = createNodeObject(cn);
        if (res) tmp.push(res);
      }
      children = tmp;
    }

    if (tagName === 'img') {
      obj.text = '';
      obj.link = n.src || '';
      obj.alt = n.alt || '';
    }

    if (tagName === 'a') {
      obj.text = n.innerText;
      obj.link = n.href || '';
    }

    if (tagName === 'button' || (tagName === 'input' && (n.type === 'button' || n.type === 'submit'))) {
      const txt = n.value || n.textContent.trim();
      if (!txt) return null;
      obj.type = 'cta';
      obj.text = txt;
      obj.link = n.formAction
        || n.getAttribute('formaction')
        || (n.closest('a') ? n.closest('a').href : '');
    } else if (tagName === 'input') {
      return null;
    }

    if (tagName === 'div' || tagName === 'section') {
      const bg = getBackgroundImage(n);
      if (bg) obj.backgroundImage = bg;
    }

    const filtered = [];
    for (const child of children) {
      const emptyWrap = (child.type === 'div' || child.type === 'section')
        && (!child.children || child.children.length === 0);
      if (!emptyWrap) filtered.push(child);
    }
    children = filtered;

    while (children.length === 1 && children[0].type === 'div') {
      const inner = children[0];
      if (inner.backgroundImage) obj.backgroundImage = inner.backgroundImage;
      children = inner.children || [];
    }

    const textNodes = [];
    const imageNodes = [];
    const linkOrButtonNodes = [];

    for (const c of children) {
      if (c.type === 'text') textNodes.push(c);
      else if (c.type === 'img') imageNodes.push(c);
      else if (['a', 'button', 'input', 'cta', 'link'].includes(c.type)) linkOrButtonNodes.push(c);
    }

    if (children.length === 1 && textNodes.length === 1 && !obj.backgroundImage) {
      return textNodes[0];
    }

    if (children.length === 1 && linkOrButtonNodes.length === 1) {
      obj.type = linkOrButtonNodes[0].type;
      obj.text = linkOrButtonNodes[0].text;
      obj.link = linkOrButtonNodes[0].link;
      return obj;
    }

    if (imageNodes.length === 1 && textNodes.length > 0 && linkOrButtonNodes.length > 0) {
      obj.type = 'imageTextLink';
      obj.children = [
        imageNodes[0],
        { type: 'text', elements: textNodes.map((t) => ({ tag: t.tag, text: t.text })) },
        linkOrButtonNodes[0],
      ];
      return obj;
    }

    if (imageNodes.length === 1 && textNodes.length > 0) {
      obj.type = 'imageText';
      obj.children = [
        imageNodes[0],
        { type: 'text', elements: textNodes.map((t) => ({ tag: t.tag, text: t.text })) },
      ];
      return obj;
    }

    if (children.length > 1 && obj.type !== 'list') obj.type = 'div';

    obj.children = children.length > 0 ? children : undefined;
    return obj;
  };

  const out = [];
  for (const n of Array.from(root.childNodes)) {
    const res = createNodeObject(n);
    if (res) out.push(res);
  }
  return out;
}

/* ---------------------------
   Analyze parsed structure
---------------------------- */

function analyzeParsedDOM(parsedDOM) {
  const processNode = (n) => {
    if (n.type === 'text') return { type: 'text', text: n.text, tag: n.tag };
    if (n.type === 'img') {
      return { type: 'img', link: new URL(n.link, document.baseURI).href, alt: n.alt || '' };
    }
    if (n.type === 'a') {
      return { type: 'link', text: n.text, link: new URL(n.link, document.baseURI).href };
    }
    if ((n.type === 'button' || n.type === 'input' || n.type === 'cta') && n.text) {
      return { type: 'cta', text: n.text, link: n.link ? new URL(n.link, document.baseURI).href : '' };
    }

    const obj = {
      type: n.type,
      children: [],
      classList: n.classList,
      tag: n.tag,
      backgroundImage: n.backgroundImage,
    };

    let textElements = [];
    if (n.children) {
      for (const child of n.children) {
        const childContent = processNode(child);
        if (childContent.type === 'text') {
          if (childContent.elements && childContent.elements.length > 0) {
            for (const e of childContent.elements) textElements.push(e);
          } else if (childContent.text) {
            textElements.push(childContent);
          }
          if (childContent.elements) {
            for (const e of childContent.elements) textElements.push(e);
          }
        } else {
          if (textElements.length > 0) {
            obj.children.push({ type: 'text', elements: textElements });
            textElements = [];
          }
          obj.children.push(childContent);
        }
      }
    }
    if (textElements.length > 0) obj.children.push({ type: 'text', elements: textElements });
    return obj;
  };

  if (Array.isArray(parsedDOM)) {
    const result = [];
    for (const n of parsedDOM) result.push(processNode(n));
    return result;
  }
  return [processNode(parsedDOM)];
}

/* ---------------------------
   Structure cleanup
---------------------------- */

function removeEmptyTags(domStructure) {
  if (!Array.isArray(domStructure)) {
    if (domStructure.children && domStructure.children.length > 0) {
      const newChild = [];
      let recheck = false;
      for (const e of domStructure.children) {
        const isWrapper = (e.type === 'div' || e.type === 'section');
        const hasMulti = e.children && e.children.length > 1;
        if ((!isWrapper || hasMulti || e.backgroundImage)) {
          removeEmptyTags(e);
          newChild.push(e);
        } else if ((domStructure.type === 'div' || domStructure.type === 'section')
          && e.children && e.children.length === 1) {
          newChild.push(e.children[0]);
          recheck = true;
        } else {
          removeEmptyTags(e);
        }
      }
      if (newChild.length > 0) {
        domStructure.children = [];
        for (const e of newChild) domStructure.children.push(e);
      }
      if (recheck) removeEmptyTags(domStructure);
    }
  } else {
    for (const node of domStructure) removeEmptyTags(node);
  }
}

function flattenComplexNodes(domStructure) {
  const isSimple = (node) => !node.children
    || node.children.every((c) => !c.children || c.children.length === 0);

  const flattenNode = (node) => {
    if (!node.children || node.children.length === 0) return [node];
    if (isSimple(node)) return [node];

    node.children = node.children.flatMap(flattenNode);
    return [node];
  };

  if (Array.isArray(domStructure)) return domStructure.flatMap(flattenNode);
  return flattenNode(domStructure);
}

/* ---------------------------
   Enhanced parser with all block types
---------------------------- */

function parseNode(node, main, fromParent = false) {
  if (node.children) {
    node.children = node.children
      .filter((e) => e.type !== 'div' || (e.children && e.children.length > 0));
  }

  // Block detection and processing - order matters (most specific first)
  if (possibleHero(node)) {
    createHeroBlockHtml(main, node, fromParent);
    return;
  }

  if (possibleQuote(node)) {
    createQuoteBlockHtml(main, node, fromParent);
    return;
  }

  if (possibleCards(node)) {
    createCardsBlockHtml(main, node, fromParent);
    return;
  }

  if (possibleColumns(node)) {
    createColumnsBlockHtml(main, node, fromParent);
    return;
  }

  if (possibleFragment(node)) {
    createFragmentBlockHtml(main, node, fromParent);
    return;
  }

  if (possibleLanguageSwitcher(node)) {
    createLanguageSwitcherBlockHtml(main, node, fromParent);
    return;
  }

  if (possibleTeaser(node)) {
    createTeaserBlockHtml(main, node, fromParent);
    return;
  }

  // Lists
  if (node.type === 'list') {
    const elem = document.createElement(node.tag === 'ul' ? 'ul' : 'ol');
    const first = node.children?.[0];
    if (first?.elements) {
      for (const e of first.elements) {
        const li = document.createElement('li');
        li.innerText = e.text;
        elem.appendChild(li);
      }
    }
    node.htmlModule = elem;
    if (elem && !fromParent) main.appendChild(elem);
    return;
  }

  // Simple text elements
  if (node.type === 'text') {
    const el = document.createElement(node.tag || 'p');
    let inner = node.text;
    if (inner) inner = inner.replace(/<br\s*\/?>/gi, ' ');
    el.innerHTML = inner;
    node.htmlModule = el;
    if (el && !fromParent) main.appendChild(el);
    return;
  }

  // Images
  if (node.type === 'img') {
    const img = document.createElement('img');
    img.src = node.link;
    if (node.alt) img.alt = node.alt;
    node.htmlModule = img;
    if (img && !fromParent) main.appendChild(img);
    return;
  }

  // Links and CTAs
  if (node.type === 'cta' || node.type === 'link') {
    const a = document.createElement('a');
    a.href = node.link || '#';
    a.title = node.text || '';
    a.innerText = node.text || '';
    node.htmlModule = a;
    if (a && !fromParent) main.appendChild(a);
    return;
  }

  // Process remaining containers
  if (Array.isArray(node)) {
    for (const c of node) parseNode(c, main);
  } else if (node.children && node.children.length > 0) {
    for (const c of node.children) parseNode(c, main);
  }
}

function parseInlineHtml(main) {
  const domStructure = parseDOM(main);
  removeEmptyTags(domStructure);
  const flattened = flattenComplexNodes(domStructure);
  const body = document.createElement('body');
  const analyzed = analyzeParsedDOM(flattened);

  if (analyzed.length === 1) {
    parseNode(analyzed[0], body);
  } else if (analyzed.length > 1) {
    for (const elem of analyzed) parseNode(elem, body);
  }
  return body;
}

/* ---------------------------
   Export hooks
---------------------------- */

export default {
  async transformDOM({ document: documentRef, url, params }) {
    let main = documentRef.body;

    WebImporter.DOMUtils.remove(main, [
      'header', '.header', 'nav', '.nav', 'footer', '.footer', 'iframe', 'noscript',
    ]);

    const cssUrls = extractCSSUrls(documentRef);
    await loadAndApplyCSS(cssUrls, documentRef);
    await new Promise((r) => window.requestAnimationFrame(r));

    main = parseInlineHtml(main);

    WebImporter.rules.createMetadata(main, documentRef);
    WebImporter.rules.transformBackgroundImages(main, documentRef);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    WebImporter.rules.convertIcons(main, documentRef);

    return main;
  },

  generateDocumentPath({ url }) {
    let p = new URL(url).pathname;
    if (p.endsWith('/')) p = `${p}index`;
    return decodeURIComponent(p)
      .toLowerCase()
      .replace(/\.html?$/, '')
      .replace(/[^a-z0-9/]/gm, '-');
  },
};