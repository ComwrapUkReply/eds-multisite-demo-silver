/**
 * Info Counter block implementation
 * Creates an animated counter with number and inline text
 * Animation triggers when block enters viewport and counts from 0 to target
 */

const ANIMATION_CONFIG = {
  DURATION: 10000, // Animation duration in milliseconds
  EASING: 'ease-out', // Animation easing function
};

/**
 * Animate a single digit from start to end
 * @param {HTMLElement} digitElement - The digit element to animate
 * @param {number} startValue - Starting value (usually 0)
 * @param {number} endValue - Ending value (0-9)
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Delay before starting animation in ms
 */
function animateDigit(digitElement, startValue, endValue, duration, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easedProgress = 1 - (1 - progress) ** 3;

        const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
        digitElement.textContent = currentValue;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          digitElement.textContent = endValue;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    }, delay);
  });
}

/**
 * Animate counter by sliding digits vertically
 * @param {HTMLElement} counterElement - The counter container element
 * @param {number} targetNumber - The target number to count to
 */
async function animateCounter(counterElement, targetNumber) {
  const numberString = targetNumber.toString();
  const digits = counterElement.querySelectorAll('.info-counter-digit');

  if (digits.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('Info Counter: No digit containers found');
    return;
  }

  // Calculate delay for each digit (staggered animation)
  const digitDelay = ANIMATION_CONFIG.DURATION / numberString.length;

  const animationPromises = [];

  digits.forEach((digitContainer, index) => {
    const digitElement = digitContainer.querySelector('.info-counter-digit-value');
    if (!digitElement) {
      // eslint-disable-next-line no-console
      console.warn(`Info Counter: No digit value element found at index ${index}`);
      return;
    }

    const targetDigit = parseInt(numberString[index] || '0', 10);
    const startDigit = 0; // Always start from 0
    const delay = index * digitDelay;

    // Animate from 0 to target digit
    animationPromises.push(
      animateDigit(digitElement, startDigit, targetDigit, ANIMATION_CONFIG.DURATION, delay),
    );
  });

  await Promise.all(animationPromises);
}

/**
 * Initialize counter animation when block enters viewport
 * @param {HTMLElement} block - The info-counter block element
 */
function initializeCounterAnimation(block) {
  const counterElement = block.querySelector('.info-counter-number');
  if (!counterElement) return;

  const targetNumberText = block.dataset.targetNumber || counterElement.textContent.trim();
  const targetNumber = parseInt(targetNumberText, 10);

  if (Number.isNaN(targetNumber) || targetNumber < 0) {
    // eslint-disable-next-line no-console
    console.warn('Info Counter: Invalid target number', targetNumberText);
    return;
  }

  // Mark as animated to prevent re-animation
  if (block.dataset.animated === 'true') {
    return;
  }

  // Use Intersection Observer to trigger animation when block enters viewport
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3, // Trigger when 30% of block is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && block.dataset.animated !== 'true') {
        block.dataset.animated = 'true';
        animateCounter(counterElement, targetNumber);
        observer.unobserve(block);
      }
    });
  }, observerOptions);

  observer.observe(block);
}

/**
 * Create digit containers for the counter
 * @param {string} numberString - The number as a string
 * @returns {DocumentFragment} Fragment containing digit containers
 */
function createDigitContainers(numberString) {
  const fragment = document.createDocumentFragment();

  // Always start from 0 for animation
  // Create containers for target number digits
  numberString.split('').forEach(() => {
    const digitContainer = document.createElement('div');
    digitContainer.className = 'info-counter-digit';

    const digitValue = document.createElement('span');
    digitValue.className = 'info-counter-digit-value';

    // Start all digits at 0 - they will animate to target
    digitValue.textContent = '0';
    digitValue.setAttribute('aria-hidden', 'true');

    digitContainer.appendChild(digitValue);
    fragment.appendChild(digitContainer);
  });

  return fragment;
}

/**
 * Decorate the info-counter block
 * @param {HTMLElement} block - The block element to decorate
 */
export default function decorate(block) {
  const rows = [...block.children];

  if (rows.length === 0) return;

  // Extract content BEFORE clearing the block
  const firstRow = rows[0];
  const cells = [...firstRow.children];

  let targetNumber = null;
  let descriptionText = '';
  let descriptionHTML = '';

  // Extract number and text from cells
  // Handle Universal Editor content structure
  cells.forEach((cell) => {
    // Check for Universal Editor attributes
    const aueProp = cell.getAttribute('data-aue-prop');
    const cellText = cell.textContent.trim();
    const cellHTML = cell.innerHTML.trim();

    // Skip empty cells or Universal Editor placeholder elements
    if (!cellText && !cellHTML) return;

    // Check if this is a number field (Universal Editor)
    if (aueProp === 'number' || cellText.match(/^\d+$/)) {
      if (targetNumber === null && cellText) {
        const numberMatch = cellText.match(/\d+/);
        if (numberMatch) {
          targetNumber = parseInt(numberMatch[0], 10);
        }
      }
      return;
    }

    // Check if this is a text field (Universal Editor) or contains text
    if (aueProp === 'text' || (!aueProp && cellText)) {
      // Extract actual text content, filtering out empty Universal Editor elements
      const textElements = cell.querySelectorAll('p, div, span');
      let hasRealContent = false;

      if (textElements.length > 0) {
        // Check if any child element has actual text
        textElements.forEach((el) => {
          const elText = el.textContent.trim();
          // Skip Universal Editor placeholder elements (empty with data-aue-prop)
          if (elText && (!el.hasAttribute('data-aue-prop') || elText)) {
            if (!descriptionText) {
              descriptionText = elText;
              descriptionHTML = el.innerHTML.trim();
              hasRealContent = true;
            }
          }
        });
      }

      // If no real content found in children, use cell content directly
      if (!hasRealContent && cellText) {
        // Filter out empty Universal Editor placeholders
        const cleanText = cellText.replace(/\s+/g, ' ').trim();
        if (cleanText) {
          descriptionText = cleanText;
          // Use textContent for HTML to avoid nested tags
          descriptionHTML = cleanText;
        }
      }
    }
  });

  // Fallback: if we have cells but didn't extract properly
  if (cells.length >= 2 && !descriptionText) {
    // Second cell should be text
    const secondCell = cells[1];
    const secondCellText = secondCell.textContent.trim();
    if (secondCellText && !secondCellText.match(/^\d+$/)) {
      descriptionText = secondCellText;
      descriptionHTML = secondCellText;
    }
  }

  // Fallback: try to extract from all rows
  if (targetNumber === null) {
    const allText = block.textContent.trim();
    const numberMatch = allText.match(/\d+/);
    if (numberMatch) {
      targetNumber = parseInt(numberMatch[0], 10);
      descriptionText = allText.replace(numberMatch[0], '').trim();
    }
  }

  // If still no number found, use default
  if (targetNumber === null || Number.isNaN(targetNumber)) {
    targetNumber = 0;
  }

  // Check for mode variant (dark or light)
  const isDarkMode = block.classList.contains('dark') || block.classList.contains('on-dark');
  const mode = isDarkMode ? 'dark' : 'light';

  // Clear block content
  block.innerHTML = '';
  block.classList.add(`info-counter-mode-${mode}`);

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'info-counter-wrapper';

  // Create number container
  const numberContainer = document.createElement('div');
  numberContainer.className = 'info-counter-number';
  numberContainer.setAttribute('aria-label', `Counter: ${targetNumber}`);

  // Create digit containers
  const numberString = targetNumber.toString();
  const digitContainers = createDigitContainers(numberString);
  numberContainer.appendChild(digitContainers);

  // Store target number for animation
  block.dataset.targetNumber = targetNumber;

  // Create text container
  const textContainer = document.createElement('div');
  textContainer.className = 'info-counter-text';

  // Only add text if we have actual content (not just empty Universal Editor placeholders)
  if (descriptionText && descriptionText.trim()) {
    // Clean up the text - remove any Universal Editor attributes from HTML
    let cleanHTML = descriptionHTML || descriptionText;
    if (cleanHTML.includes('data-aue-prop')) {
      // Remove Universal Editor attributes from HTML string
      cleanHTML = cleanHTML.replace(/\s*data-aue-[^=]*="[^"]*"/g, '');
    }

    // Create a single paragraph element (no nesting)
    const textParagraph = document.createElement('p');
    // Use textContent to avoid nested tags, or clean HTML if it's different
    if (cleanHTML && cleanHTML !== descriptionText && !cleanHTML.match(/^<p[^>]*>.*<\/p>$/i)) {
      // If HTML doesn't already have a p tag wrapper, use innerHTML
      textParagraph.innerHTML = cleanHTML;
    } else {
      // Use textContent to ensure no nested tags
      textParagraph.textContent = descriptionText;
    }
    textContainer.appendChild(textParagraph);
  }

  // Assemble structure
  wrapper.appendChild(numberContainer);
  wrapper.appendChild(textContainer);
  block.appendChild(wrapper);

  // Initialize animation
  initializeCounterAnimation(block);
}
