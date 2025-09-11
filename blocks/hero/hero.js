/**
 * Hero block implementation
 * Creates the hero banner with title, description, and action buttons
 */

export default function decorate(block) {
  // Get all rows from the block
  const rows = [...block.children];

  // Apply image position class based on the imagePosition field
  applyImagePositionClass(block);

  // Add classes to rows
  rows.forEach((row, rowIndex) => {
    const columns = [...row.children];

    if (rowIndex === 0) {
      // First row - image row
      row.classList.add('hero-image-row');
      columns.forEach((col, colIndex) => {
        col.classList.add('hero-image-col');

        // Add classes to image elements
        const picture = col.querySelector('picture');
        const img = col.querySelector('img');

        if (picture) picture.classList.add('hero-picture');
        if (img) img.classList.add('hero-image');
      });
    } else if (rowIndex === 1) {
      // Second row - content row
      row.classList.add('hero-content-row');
      columns.forEach((col, colIndex) => {
        col.classList.add('hero-content-col');

        // Add classes to content elements
        const h1 = col.querySelector('h1');
        const h4 = col.querySelector('h4');
        const buttonContainers = col.querySelectorAll('.button-container');
        const buttons = col.querySelectorAll('.button');

        if (h1) h1.classList.add('hero-title');
        if (h4) h4.classList.add('hero-subtitle');

        // Add classes to button containers and buttons
        buttonContainers.forEach((container, btnIndex) => {
          if (btnIndex === 0) {
            container.classList.add('hero-primary-button-container');
            const primaryBtn = container.querySelector('.button');
            if (primaryBtn) primaryBtn.classList.add('hero-btn-primary');
          } else {
            container.classList.add('hero-secondary-button-container');
            const secondaryBtn = container.querySelector('.button');
            if (secondaryBtn) secondaryBtn.classList.add('hero-btn-secondary');
          }
        });
      });
    }
  });

  // Add any interactive functionality
  initializeHeroInteractions(block);
}

/**
 * Initialize hero interactions and animations
 */
function initializeHeroInteractions(block) {
  const primaryButton = block.querySelector('.hero-btn-primary');
  const secondaryButton = block.querySelector('.hero-btn-secondary');

  // Add click tracking for analytics
  if (primaryButton) {
    primaryButton.addEventListener('click', (e) => {
      // Track contact sales button click
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'hero_cta_click',
          cta_type: 'contact_sales',
        });
      }
    });
  }

  if (secondaryButton) {
    secondaryButton.addEventListener('click', (e) => {
      // Track order now button click
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'hero_cta_click',
          cta_type: 'order_now',
        });
      }
    });
  }
}

/**
 * Apply image position class based on the imagePosition field
 * This function reads the imagePosition value and applies the appropriate CSS class
 */
function applyImagePositionClass(block) {
  // Find the wrapper element (parent of the block)
  const wrapper = block.closest('.hero-wrapper') || block.parentElement;
  
  if (!wrapper) return;

  // Get the imagePosition value from the block's data attributes or content
  // This will be populated by the Universal Editor based on the field value
  const imagePosition = getImagePositionValue(block);
  
  if (imagePosition && imagePosition !== 'right') {
    // Remove any existing image position classes
    wrapper.classList.remove(
      'image-position-left',
      'image-position-center', 
      'image-position-top',
      'image-position-bottom'
    );
    
    // Add the new image position class
    wrapper.classList.add(`image-position-${imagePosition}`);
  }
}

/**
 * Extract image position value from block content or data attributes
 * This function looks for the imagePosition field value in the block structure
 */
function getImagePositionValue(block) {
  // Look for imagePosition in data attributes first
  const dataPosition = block.dataset.imagePosition || block.dataset.imageposition;
  if (dataPosition) return dataPosition;
  
  // Look for imagePosition in the block's text content (fallback)
  // This handles cases where the value is stored in the content structure
  const textContent = block.textContent || '';
  const positionMatch = textContent.match(/imagePosition[:\s]*(\w+)/i);
  if (positionMatch) return positionMatch[1];
  
  // Default to 'right' if no position is found
  return 'right';
}
