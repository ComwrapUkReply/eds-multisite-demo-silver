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

const CLASS_HINTS = {
  teaser: [
    'teaser', 'cmp-teaser', 'hero-teaser', 'promo',
    'tile', 'lead', 'card--teaser',
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

function hasHeading(kids) {
  if (!kids) return false;
  for (const k of kids) {
    const tag = (k.tag || '').toLowerCase();
    if (k.type === 'text' && (tag === 'h1' || tag === 'h2' || tag === 'h3')) return true;
  }
  return false;
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
   Teaser pattern detection
---------------------------- */

function possibleTeaser(node) {
  // Check if the node exists and has at least one child element
  if (!node?.children || node.children.length < 1) return false;

  // Flatten the node's children to get a simplified structure for analysis
  const kids = flattenTexts(node.children);

  // Look for an image in the children, or use background image if available
  const img = firstImg(kids) || (node.backgroundImage ? { type: 'img', link: node.backgroundImage } : null);

  // Find the first heading element in the children
  const heading = firstHeading(kids);

  // Find the first call-to-action (CTA) element in the children
  const cta = firstCta(kids);

  // Check if there are any paragraph elements (descriptions) present
  const hasDesc = allParas(kids).length > 0;

  // Enhanced detection for teaser patterns
  // Pattern 1: Has an image AND either a heading or description
  const hasImageAndContent = img && (heading || hasDesc);

  // Pattern 2: Has both a heading and a call-to-action
  const hasHeadingAndCTA = heading && cta;

  // Pattern 3: Has CSS classes that hint this is a teaser component
  const hasClassHint = hasAnyClass(node, CLASS_HINTS.teaser);

  // Pattern 4: Has a background image AND either a heading or description
  const hasBackgroundImage = node.backgroundImage && (heading || hasDesc);

  // Single content item that could be a teaser
  // Pattern 5: Only one child element but contains heading or description content
  const isSingleContent = node.children.length === 1 && (heading || hasDesc);

  // Pattern 6: All children are image, img alt, title, description
  const isTeaserImageTitleDescription = node.children.length === 1 && img && heading && hasDesc;

  // Pattern 7: All children are image, title, description, CTA button
  const isTeaserImageTitleDescriptionCTA = node.children.length === 1 && img && img.alt && heading && hasDesc && cta;

  // Return true if any of the teaser patterns are detected
  return Boolean(
    hasImageAndContent || hasHeadingAndCTA || hasClassHint || hasBackgroundImage || isSingleContent || isTeaserImageTitleDescription || isTeaserImageTitleDescriptionCTA,
  );
}

/* ---------------------------
   Teaser block table builder
---------------------------- */

function createTableBlock(name, rows, documentRef) {
  // Create a 2D array for table cells, starting with the block name as the header
  const cells = [[name]];
  // Add each row from the rows parameter to the cells array
  for (const r of rows) cells.push(r);
  // Use WebImporter utility to create an HTML table from the cells array
  return WebImporter.DOMUtils.createTable(cells, documentRef);
}

function createTeaserBlockHtml(main, node, fromParent) {
  // Extract and flatten text content from the node's children for easier processing
  const kids = flattenTexts(node.children || []);
  
  // Find the first image in children, or create an image object from background image if present
  const imgNode = firstImg(kids) || (node.backgroundImage
    ? { type: 'img', link: node.backgroundImage }
    : null);
  
  // Extract the first heading element from the flattened children
  const h = firstHeading(kids);
  
  // Extract all paragraph elements (descriptions) from the flattened children
  const descs = allParas(kids);
  
  // Extract the first call-to-action (CTA) element from the flattened children
  const ctaNode = firstCta(kids);

  // Create teaser table with proper structure for Universal Editor
  // Start with the block name 'Teaser' as the first row
  const cells = [['Teaser']];

  // Create image cell
  if (imgNode) {
    // Create a container div for the image
    const imgCell = document.createElement('div');
    // Create the actual img element
    const img = document.createElement('img');
    img.src = imgNode.link;
    img.alt = imgNode.alt || '';
    // Add Universal Editor attributes for image property
    img.setAttribute('data-aue-prop', 'image');
    img.setAttribute('data-aue-type', 'reference');
    imgCell.appendChild(img);
    // Add the image cell as a new row in the table
    cells.push([imgCell]);
  }

  // Create imageAlt cell
  if (imgNode?.alt) {
    // Create a container for the alt text
    const altCell = document.createElement('div');
    altCell.textContent = imgNode.alt;
    // Add Universal Editor attributes for imageAlt property
    altCell.setAttribute('data-aue-prop', 'imageAlt');
    altCell.setAttribute('data-aue-type', 'text');
    // Add the alt text cell as a new row in the table
    cells.push([altCell]);
  }

  // Create title cell
  if (h) {
    // Create a container for the title
    const titleCell = document.createElement('div');
    // Create the heading element (default to h2 if no tag specified)
    const hEl = document.createElement(h.tag || 'h2' || 'h1');
    // Set the heading content, replacing <br> tags with spaces
    hEl.innerHTML = (h.text || '').replace(/<br\s*\/?>/gi, ' ');
    // Add Universal Editor attributes for title property
    hEl.setAttribute('data-aue-prop', 'title');
    hEl.setAttribute('data-aue-type', 'richtext');
    titleCell.appendChild(hEl);
    // Add the title cell as a new row in the table
    cells.push([titleCell]);
  }

  // Create description cell
  if (descs.length > 0) {
    // Create a container for the description
    const descCell = document.createElement('div');
    // Create a wrapper div for all description paragraphs
    const descWrapper = document.createElement('div');
    // Add Universal Editor attributes for description property
    descWrapper.setAttribute('data-aue-prop', 'description');
    descWrapper.setAttribute('data-aue-type', 'richtext');

    // Process each description paragraph
    for (const p of descs) {
      const pEl = document.createElement('p');
      // Set paragraph content, replacing <br> tags with spaces
      pEl.innerHTML = (p.text || '').replace(/<br\s*\/?>/gi, ' ');
      descWrapper.appendChild(pEl);
    }
    descCell.appendChild(descWrapper);
    // Add the description cell as a new row in the table
    cells.push([descCell]);
  }

  // Create link cell
  if (ctaNode) {
    // Create a container for the link
    const linkCell = document.createElement('div');
    // Create a wrapper for the link with Universal Editor attributes
    const linkWrapper = document.createElement('div');
    linkWrapper.setAttribute('data-aue-prop', 'link');
    linkWrapper.setAttribute('data-aue-type', 'aem-content');

    // Create the actual anchor element
    const a = document.createElement('a');
    a.href = ctaNode.link || '#';
    // Use CTA text or default to 'Learn More'
    a.textContent = (ctaNode.text || '').trim() || 'Learn More';
    linkWrapper.appendChild(a);
    linkCell.appendChild(linkWrapper);
    // Add the link cell as a new row in the table
    cells.push([linkCell]);
  }

  // Create linkText cell
  if (ctaNode) {
    // Create a container for the link text (separate from the link itself)
    const linkTextCell = document.createElement('div');
    // Use CTA text or default to 'Learn More'
    linkTextCell.textContent = (ctaNode.text || '').trim() || 'Learn More';
    // Add Universal Editor attributes for linkText property
    linkTextCell.setAttribute('data-aue-prop', 'linkText');
    linkTextCell.setAttribute('data-aue-type', 'text');
    // Add the link text cell as a new row in the table
    cells.push([linkTextCell]);
  }

  // Create variant cell (default to 'default')
  // This allows for different visual variations of the teaser component
  const variantCell = document.createElement('div');
  variantCell.textContent = 'default';
  // Add Universal Editor attributes for variant property
  variantCell.setAttribute('data-aue-prop', 'variant');
  variantCell.setAttribute('data-aue-type', 'select');
  // Add the variant cell as a new row in the table
  cells.push([variantCell]);

  // Create the final HTML table using WebImporter utility
  const table = WebImporter.DOMUtils.createTable(cells, document);
  
  // If not called from a parent function, append the table to the main container
  if (!fromParent) main.appendChild(table);
  
  // Store the generated table HTML in the node object for later use
  // eslint-disable-next-line no-param-reassign
  node.htmlModule = table;
}

/* ---------------------------
   DOM → JSON
---------------------------- */

/**
 * Transforms text nodes that contain links by extracting the link element.
 * 
 * This function checks if a DOM node is a text element (p, h1-h6, span) that contains
 * an anchor (<a>) tag as a child. If found, it creates a new anchor element with the
 * same href and text content, effectively "promoting" the link from being nested
 * inside a text element to being the primary element.
 * 
 * @param {Node} node - The DOM node to potentially transform
 * @param {Document} documentRef - Document reference for creating new elements
 * @returns {Node} Either a new anchor element if transformation occurred, or the original node
 */
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

/**
 * Parses a DOM tree and converts it into a structured JavaScript object representation.
 * 
 * This function recursively traverses DOM nodes and creates a normalized object structure
 * that can be used for further processing or conversion to other formats. It handles
 * various HTML elements and applies transformations to create a clean, semantic structure.
 * 
 * @param {Element} root - The root DOM element to parse
 * @returns {Array} Array of parsed node objects representing the DOM structure
 */
function parseDOM(root) {
  /**
   * Creates a normalized node object from a DOM element.
   * Handles element transformation, filtering, and structural optimization.
   * 
   * @param {Node} node - The DOM node to convert
   * @returns {Object|null} Parsed node object or null if node should be ignored
   */
  const createNodeObject = (node) => {
    const doc = node.ownerDocument || document;
    // Transform text nodes that contain links (extract the link as primary element)
    const transformed = transformTextNodeWithLink(node, doc);
    const n = transformed;

    // Skip non-element nodes
    if (n.nodeType !== Node.ELEMENT_NODE) return null;

    let tagName = n.nodeName.toLowerCase();
    const style = window.getComputedStyle(n);

    // Filter out hidden elements and unwanted tags
    if (style.display === 'none' || ['script', 'style', 'iframe', 'noscript'].includes(tagName)) {
      return null;
    }
    
    // Normalize tag names: convert article with only text to paragraph
    if (tagName === 'article' && containsOnlyText(n)) tagName = 'p';
    // Convert unknown tags to generic div
    if (!KNOWN_TAGS.includes(tagName)) tagName = 'div';

    // Initialize the base node object
    const obj = { type: tagName, children: [], classList: n.classList };
    let children = [];

    // Handle divs that contain only text - convert to text nodes
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

    // Handle list elements
    if (tagName === 'ol' || tagName === 'ul') {
      obj.type = 'list';
      obj.tag = tagName;
    }

    // Handle text-containing elements - extract their innerHTML as text
    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'li', 'summary'].includes(tagName)) {
      obj.text = n.innerHTML;
      obj.type = 'text';
      obj.tag = tagName;
    } else {
      // For non-text elements, recursively process child nodes
      const tmp = [];
      for (const cn of Array.from(n.childNodes)) {
        const res = createNodeObject(cn);
        if (res) tmp.push(res);
      }
      children = tmp;
    }

    // Handle image elements - extract src and alt attributes
    if (tagName === 'img') {
      obj.text = '';
      obj.link = n.src || '';
      obj.alt = n.alt || '';
    }
    
    // Handle anchor elements - extract href and text content
    if (tagName === 'a') {
      obj.text = n.innerText;
      obj.link = n.href || '';
    }
    
    // Handle button and submit input elements - convert to CTA (call-to-action) type
    if (tagName === 'button' || (tagName === 'input' && (n.type === 'button' || n.type === 'submit'))) {
      const txt = n.value || n.textContent.trim();
      if (!txt) return null; // Skip buttons without text
      obj.type = 'cta';
      obj.text = txt;
      // Try to find associated action URL from various sources
      obj.link = n.formAction
        || n.getAttribute('formaction')
        || (n.closest('a') ? n.closest('a').href : '');
    } else if (tagName === 'input') {
      // Skip other input types
      return null;
    }

    // Extract background images from container elements
    if (tagName === 'div' || tagName === 'section') {
      const bg = getBackgroundImage(n);
      if (bg) obj.backgroundImage = bg;
    }

    // Remove empty wrapper elements (divs/sections with no children)
    const filtered = [];
    for (const child of children) {
      const emptyWrap = (child.type === 'div' || child.type === 'section')
        && (!child.children || child.children.length === 0);
      if (!emptyWrap) filtered.push(child);
    }
    children = filtered;

    // Flatten unnecessary nesting: unwrap single-child divs
    while (children.length === 1 && children[0].type === 'div') {
      const inner = children[0];
      // Preserve background image from inner div
      if (inner.backgroundImage) obj.backgroundImage = inner.backgroundImage;
      children = inner.children || [];
    }

    // Categorize children by type for pattern matching
    const textNodes = [];
    const imageNodes = [];
    const linkOrButtonNodes = [];

    for (const c of children) {
      if (c.type === 'text') textNodes.push(c);
      else if (c.type === 'img') imageNodes.push(c);
      else if (['a', 'button', 'input', 'cta', 'link'].includes(c.type)) linkOrButtonNodes.push(c);
    }

    // Optimization: if container has only one text child and no background, return the text directly
    if (children.length === 1 && textNodes.length === 1 && !obj.backgroundImage) {
      return textNodes[0];
    }

    // Optimization: if container has only one link/button child, promote it to container level
    if (children.length === 1 && linkOrButtonNodes.length === 1) {
      obj.type = linkOrButtonNodes[0].type;
      obj.text = linkOrButtonNodes[0].text;
      obj.link = linkOrButtonNodes[0].link;
      return obj;
    }

    // Pattern: Image + Text + Link/Button = imageTextLink component
    if (imageNodes.length === 1 && textNodes.length > 0 && linkOrButtonNodes.length > 0) {
      obj.type = 'imageTextLink';
      obj.children = [
        imageNodes[0],
        { type: 'text', elements: textNodes.map((t) => ({ tag: t.tag, text: t.text })) },
        linkOrButtonNodes[0],
      ];
      return obj;
    }

    // Pattern: Image + Text = imageText component
    if (imageNodes.length === 1 && textNodes.length > 0) {
      obj.type = 'imageText';
      obj.children = [
        imageNodes[0],
        { type: 'text', elements: textNodes.map((t) => ({ tag: t.tag, text: t.text })) },
      ];
      return obj;
    }

    // Default: if multiple children and not a list, treat as generic container
    if (children.length > 1 && obj.type !== 'list') obj.type = 'div';

    // Only include children array if it has content
    obj.children = children.length > 0 ? children : undefined;
    return obj;
  };

  // Process all child nodes of the root element
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
        // eslint-disable-next-line no-param-reassign
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

    // eslint-disable-next-line no-param-reassign
    node.children = node.children.flatMap(flattenNode);
    return [node];
  };

  if (Array.isArray(domStructure)) return domStructure.flatMap(flattenNode);
  return flattenNode(domStructure);
}

/* ---------------------------
   Teaser-focused parser
---------------------------- */

function parseNode(node, main, fromParent = false) {
  if (node.children) {
    // eslint-disable-next-line no-param-reassign
    node.children = node.children
      .filter((e) => e.type !== 'div' || (e.children && e.children.length > 0));
  }

  // Teaser detection and processing
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
    // eslint-disable-next-line no-param-reassign
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
    // eslint-disable-next-line no-param-reassign
    node.htmlModule = el;
    if (el && !fromParent) main.appendChild(el);
    return;
  }

  // Images
  if (node.type === 'img') {
    const img = document.createElement('img');
    img.src = node.link;
    if (node.alt) img.alt = node.alt;
    // eslint-disable-next-line no-param-reassign
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
    // eslint-disable-next-line no-param-reassign
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