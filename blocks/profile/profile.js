import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const PROFILE_CONFIG = {
  IMAGE_WIDTHS: [{ width: '60' }, { width: '120' }, { width: '180' }],
};

/**
 * Profile block implementation
 * Displays author profile with image and name
 */
export default function decorate(block) {
  const rows = [...block.children];

  if (rows.length === 0) return;

  block.textContent = '';

  const profileWrapper = document.createElement('div');
  profileWrapper.className = 'profile-wrapper';

  let imageElement = null;
  let authorName = '';
  let authorPrefix = 'Autor: ';

  // Extract content from rows
  rows.forEach((row) => {
    const cells = [...row.children];

    cells.forEach((cell) => {
      const elements = [...cell.children];

      // Handle cell with direct text content
      if (elements.length === 0 && cell.textContent.trim()) {
        const textContent = cell.textContent.trim();
        if (!authorName && textContent) {
          authorName = textContent;
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

        // Find text content for author name
        if (element.tagName === 'DIV' || element.tagName === 'P') {
          const textContent = element.textContent?.trim();
          if (textContent && !authorName) {
            // Check if it contains "Autor: " prefix
            if (textContent.startsWith('Autor: ')) {
              authorPrefix = 'Autor: ';
              authorName = textContent.replace('Autor: ', '').trim();
            } else {
              authorName = textContent;
            }
            return;
          }
        }

        // Find links (author name might be in a link)
        const link = element.querySelector('a');
        if (link && !authorName) {
          const linkText = link.textContent?.trim();
          if (linkText) {
            authorName = linkText;
            return;
          }
        }
      });
    });
  });

  // Build image container
  if (imageElement) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'profile-image';

    const optimizedPicture = createOptimizedPicture(
      imageElement.src,
      imageElement.alt || 'Profile image',
      false,
      PROFILE_CONFIG.IMAGE_WIDTHS,
    );

    moveInstrumentation(imageElement, optimizedPicture.querySelector('img'));
    imageContainer.appendChild(optimizedPicture);
    profileWrapper.appendChild(imageContainer);
  }

  // Build content container
  const contentContainer = document.createElement('div');
  contentContainer.className = 'profile-content';

  if (authorName) {
    const authorContainer = document.createElement('div');
    authorContainer.className = 'profile-author';

    // Add prefix
    const prefixSpan = document.createElement('span');
    prefixSpan.className = 'profile-author-prefix';
    prefixSpan.textContent = authorPrefix;

    // Add author name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'profile-author-name';
    nameSpan.textContent = authorName;

    authorContainer.appendChild(prefixSpan);
    authorContainer.appendChild(nameSpan);
    contentContainer.appendChild(authorContainer);
  }

  profileWrapper.appendChild(contentContainer);

  // Add variant classes based on block classes
  const blockClasses = [...block.classList];
  const variantClass = blockClasses.find(cls => 
    ['default', 'horizontal', 'vertical', 'compact'].includes(cls)
  );
  
  if (variantClass) {
    profileWrapper.classList.add(`profile-${variantClass}`);
  } else {
    profileWrapper.classList.add('profile-default');
  }

  block.appendChild(profileWrapper);

  if (rows.length > 0) {
    moveInstrumentation(rows[0], block);
  }
}
