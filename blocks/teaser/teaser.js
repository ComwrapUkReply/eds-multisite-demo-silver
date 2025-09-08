import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const TEASER_CONFIG = {
  IMAGE_WIDTHS: [{ width: '400' }, { width: '600' }, { width: '800' }],
};

export default function decorate(block) {
  const rows = [...block.children];

  if (rows.length === 0) return;

  block.textContent = '';

  const teaserWrapper = document.createElement('div');
  teaserWrapper.className = 'teaser-wrapper';

  let imageElement = null;
  let titleElement = null;
  let descriptionElement = null;
  let linkElement = null;

  // Extract content from rows
  rows.forEach((row) => {
    const cells = [...row.children];

    cells.forEach((cell) => {
      const elements = [...cell.children];

      // Handle cell with direct text content
      if (elements.length === 0 && cell.textContent.trim()) {
        const textContent = cell.textContent.trim();
        if (!titleElement) {
          titleElement = document.createElement('h2');
          titleElement.textContent = textContent;
        } else if (!descriptionElement) {
          descriptionElement = document.createElement('p');
          descriptionElement.textContent = textContent;
        }
        return;
      }

      // Process child elements
      elements.forEach((element) => {
        // Find images
        const img = element.querySelector('img') || (element.tagName === 'IMG' ? element : null);
        const picture = element.querySelector('picture') || (element.tagName === 'PICTURE' ? element : null);

        if ((img || picture) && !imageElement) {
          imageElement = img || picture.querySelector('img');
          return;
        }

        // Find headings
        if (['H1', 'H2', 'H3', 'H4'].includes(element.tagName) && !titleElement) {
          titleElement = element.cloneNode(true);
          return;
        }

        // Find title in DIV elements (Universal Editor)
        if (element.tagName === 'DIV' && !titleElement) {
          const textContent = element.textContent?.trim();
          if (textContent && textContent.length <= 200) {
            titleElement = document.createElement('h2');
            titleElement.textContent = textContent;
            return;
          }
        }

        // Find links
        const link = element.querySelector('a');
        if (link && !linkElement) {
          linkElement = link.cloneNode(true);

          // Handle Universal Editor linkText
          if (link.hasAttribute('data-aue-prop') && link.getAttribute('data-aue-prop') === 'linkText') {
            const currentText = link.textContent?.trim();
            const linkText = (currentText && !currentText.startsWith('/content/') && !currentText.startsWith('http'))
              ? currentText : 'Learn More';
            linkElement.textContent = linkText;
          }
          return;
        }

        // Find paragraphs
        if (element.tagName === 'P' && !element.querySelector('a') && !descriptionElement) {
          descriptionElement = element.cloneNode(true);
          return;
        }

        // Find description in DIV elements (Universal Editor)
        if (element.tagName === 'DIV' && !descriptionElement) {
          const textContent = element.textContent?.trim();
          if (textContent && (titleElement || textContent.length > 50)) {
            descriptionElement = document.createElement('p');
            descriptionElement.textContent = textContent;
          }
        }
      });
    });
  });

  // Build image container
  if (imageElement) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'teaser-image';

    const optimizedPicture = createOptimizedPicture(
      imageElement.src,
      imageElement.alt || 'Teaser image',
      false,
      TEASER_CONFIG.IMAGE_WIDTHS,
    );

    moveInstrumentation(imageElement, optimizedPicture.querySelector('img'));
    imageContainer.appendChild(optimizedPicture);
    teaserWrapper.appendChild(imageContainer);
  }

  // Build content container
  const contentContainer = document.createElement('div');
  contentContainer.className = 'teaser-content';

  if (titleElement) {
    titleElement.className = 'teaser-title';
    contentContainer.appendChild(titleElement);
  }

  if (descriptionElement) {
    descriptionElement.className = 'teaser-description';
    contentContainer.appendChild(descriptionElement);
  }

  if (linkElement) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'teaser-button-container';
    linkElement.className = 'teaser-button';
    buttonContainer.appendChild(linkElement);
    contentContainer.appendChild(buttonContainer);
  }

  teaserWrapper.appendChild(contentContainer);

  // Make entire teaser clickable if link exists
  if (linkElement?.href) {
    teaserWrapper.addEventListener('click', (e) => {
      if (!e.target.closest('.teaser-button')) {
        window.open(linkElement.href, linkElement.target || '_self');
      }
    });
    teaserWrapper.style.cursor = 'pointer';
    teaserWrapper.setAttribute('role', 'button');
    teaserWrapper.setAttribute('tabindex', '0');

    teaserWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.open(linkElement.href, linkElement.target || '_self');
      }
    });
  }

  block.appendChild(teaserWrapper);

  if (rows.length > 0) {
    moveInstrumentation(rows[0], block);
  }
}