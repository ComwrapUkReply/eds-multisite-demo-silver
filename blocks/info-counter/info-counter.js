/**
 * Info Counter block implementation
 * Creates an animated counter with number and inline text
 * Animation triggers when block enters viewport and counts from 1 to target
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
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
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
  
  // Calculate delay for each digit (staggered animation)
  const digitDelay = ANIMATION_CONFIG.DURATION / numberString.length;
  
  // Determine starting value: if target > 1, start at 1, otherwise start at target
  const startValue = targetNumber > 1 ? 1 : targetNumber;
  const startString = startValue.toString();
  
  const animationPromises = [];
  
  digits.forEach((digitContainer, index) => {
    const digitElement = digitContainer.querySelector('.info-counter-digit-value');
    if (!digitElement) return;
    
    const targetDigit = parseInt(numberString[index] || '0', 10);
    // Get starting digit: if index is within startString length, use that digit, otherwise 0
    const startDigit = index < startString.length ? parseInt(startString[index], 10) : 0;
    const delay = index * digitDelay;
    
    // Animate from start digit to target digit
    animationPromises.push(animateDigit(digitElement, startDigit, targetDigit, ANIMATION_CONFIG.DURATION, delay));
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
  
  if (isNaN(targetNumber) || targetNumber < 0) {
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
 * @param {number} targetNumber - The target number
 * @returns {DocumentFragment} Fragment containing digit containers
 */
function createDigitContainers(numberString, targetNumber) {
  const fragment = document.createDocumentFragment();
  
  // Determine starting value: if target > 1, start at 1, otherwise start at target
  // For display, we show the starting number naturally (not zero-padded)
  const startValue = targetNumber > 1 ? 1 : targetNumber;
  const startString = startValue.toString();
  
  // Create containers for target number digits
  numberString.split('').forEach((digit, index) => {
    const digitContainer = document.createElement('div');
    digitContainer.className = 'info-counter-digit';
    
    const digitValue = document.createElement('span');
    digitValue.className = 'info-counter-digit-value';
    
    // Set initial value: show starting digit if it exists at this position, otherwise show 0
    // For numbers starting at 1, first digit shows 1, others show 0
    if (index < startString.length) {
      digitValue.textContent = startString[index];
    } else {
      digitValue.textContent = '0';
    }
    
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
  
  // Extract content from first row
  const firstRow = rows[0];
  const cells = [...firstRow.children];
  
  let targetNumber = null;
  let descriptionText = '';
  
  // Extract number and text from cells
  cells.forEach((cell) => {
    const cellText = cell.textContent.trim();
    
    // Check if cell contains a number
    const numberMatch = cellText.match(/^\d+$/);
    if (numberMatch && targetNumber === null) {
      targetNumber = parseInt(numberMatch[0], 10);
    } else if (cellText && !numberMatch) {
      // This is likely the description text
      descriptionText = cellText;
    }
  });
  
  // Fallback: try to extract from any text content
  if (targetNumber === null) {
    const allText = block.textContent.trim();
    const numberMatch = allText.match(/\d+/);
    if (numberMatch) {
      targetNumber = parseInt(numberMatch[0], 10);
      descriptionText = allText.replace(numberMatch[0], '').trim();
    }
  }
  
  // If still no number found, use default
  if (targetNumber === null || isNaN(targetNumber)) {
    targetNumber = 0;
  }
  
  // Check for mode variant (dark or light)
  const isDarkMode = block.classList.contains('dark') || block.classList.contains('on-dark');
  const mode = isDarkMode ? 'dark' : 'light';
  
  // Clear block content
  block.textContent = '';
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
  const digitContainers = createDigitContainers(numberString, targetNumber);
  numberContainer.appendChild(digitContainers);
  
  // Store target number for animation
  block.dataset.targetNumber = targetNumber;
  
  // Create text container
  const textContainer = document.createElement('div');
  textContainer.className = 'info-counter-text';
  
  if (descriptionText) {
    const textParagraph = document.createElement('p');
    textParagraph.textContent = descriptionText;
    textContainer.appendChild(textParagraph);
  } else {
    // Try to preserve any existing text content
    const existingText = rows[0].textContent.trim();
    if (existingText && !existingText.match(/^\d+$/)) {
      const textParagraph = document.createElement('p');
      textParagraph.textContent = existingText.replace(/\d+/g, '').trim();
      textContainer.appendChild(textParagraph);
    }
  }
  
  // Assemble structure
  wrapper.appendChild(numberContainer);
  wrapper.appendChild(textContainer);
  block.appendChild(wrapper);
  
  // Initialize animation
  initializeCounterAnimation(block);
}

