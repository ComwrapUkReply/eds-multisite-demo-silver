/**
 * Info Counter block implementation
 * Creates an animated counter with number and inline text
 * Animation triggers when block enters viewport and counts from 0 to target
 */

const ANIMATION_CONFIG = {
  DURATION: 2000, // Animation duration in milliseconds
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
  // First, try to find number in first cell, text in second cell
  if (cells.length >= 2) {
    // Two cells: first is number, second is text
    const firstCellText = cells[0].textContent.trim();
    const numberMatch = firstCellText.match(/^\d+$/);
    if (numberMatch) {
      targetNumber = parseInt(numberMatch[0], 10);
    }

    // Get text from second cell (preserve HTML)
    if (cells[1].innerHTML.trim()) {
      descriptionHTML = cells[1].innerHTML.trim();
      descriptionText = cells[1].textContent.trim();
    }
  } else if (cells.length === 1) {
    // Single cell: try to extract both number and text
    const cellText = cells[0].textContent.trim();
    const cellHTML = cells[0].innerHTML.trim();

    // Try to find number first
    const numberMatch = cellText.match(/\d+/);
    if (numberMatch) {
      targetNumber = parseInt(numberMatch[0], 10);
      // Remove number from text
      descriptionText = cellText.replace(numberMatch[0], '').trim();
      descriptionHTML = cellHTML.replace(numberMatch[0], '').trim();
    } else {
      // No number found, treat entire cell as text
      descriptionText = cellText;
      descriptionHTML = cellHTML;
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

  if (descriptionText || descriptionHTML) {
    const textParagraph = document.createElement('p');
    // Use HTML if available, otherwise use text
    if (descriptionHTML && descriptionHTML !== descriptionText) {
      textParagraph.innerHTML = descriptionHTML;
    } else {
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
