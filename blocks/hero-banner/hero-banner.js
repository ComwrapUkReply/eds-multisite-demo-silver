import {
  getNodeByOptions,
  setAttributesFromModel,
  setMargin,
  setBlockId,
  BACKGROUND_BLOCK_GRAY_CLASS,
  BACKGROUND_BLOCK_BLUE_CLASS,
  setOptions,
} from '../../scripts/utils.js';

import {
  applyButtonPlaceholderRendering,
  getButtonAsJsonString,
} from '../../scripts/utils/button.js';
import { getAemAuthorEnv } from '../../scripts/configs.js';

/**
 * Checks and adjusts hero level 4 layout based on content height
 * @param {Element} block the Hero-banner block element
 */
function adjustHeroLevel4Layout(block) {
  if (!block.classList.contains('hero-level_4')) {
    return;
  }

  const infoContainer = block.querySelector('.info-container');
  const imageContainer = block.querySelector('.image-container');
  const infoTextContainer = block.querySelector('.info-text-container');

  if (!infoContainer || !imageContainer || !infoTextContainer) {
    return;
  }

  // Wait for images to load to get accurate heights
  const images = imageContainer.querySelectorAll('img');
  if (images.length > 0) {
    Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) {
          return Promise.resolve();
        }
        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      }),
    ).then(() => {
      checkAndAdjustHeight(infoContainer, imageContainer);
      block.style.display = 'flex';
    });
  } else {
    // No images, check immediately
    checkAndAdjustHeight(infoContainer, imageContainer);
  }

  // Add resize listener to recheck heights when window is resized
  const resizeHandler = () => {
    checkAndAdjustHeight(infoContainer, imageContainer);
  };

  // Remove any existing resize listener to prevent duplicates
  if (block.resizeHandler) {
    window.removeEventListener('resize', block.resizeHandler);
  }

  // Store the handler reference and add the listener
  block.resizeHandler = resizeHandler;
  window.addEventListener('resize', resizeHandler);
}

/**
 * Compares heights and applies appropriate styles
 * @param {Element} infoContainer the info container element
 * @param {Element} imageContainer the image container element
 */
function checkAndAdjustHeight(infoContainer, imageContainer) {
  const infoHeight = infoContainer.offsetHeight;
  const imageHeight = imageContainer.offsetHeight;

  if (infoHeight > imageHeight || window.innerWidth < 802) {
    infoContainer.classList.add('info-container-mobile');
    infoContainer.classList.remove('info-container-desktop');
  } else {
    infoContainer.classList.add('info-container-desktop');
    infoContainer.classList.remove('info-container-mobile');
  }
}

const buttonTemplate = (props) => (getAemAuthorEnv()
  ? `<a href="${props.link}" class="button button--${props.linkStyle}">${props.linkLabel}</a>`
  : getButtonAsJsonString(props));

/**
 * Loads and decorates the Hero-banner block element
 * @param {Element} block the Hero-banner block element
 */
export default function decorate(block) {
  const blockWrappers = [...block.children];
  const heroOptions = [
    {
      label: 'id', name: 'id', value: '', visible: false,
    },
    {
      label: 'layout', name: 'layout', value: '', visible: false,
    },
    {
      label: 'hero-option', name: 'hero-option', value: '', visible: false,
    },
    {
      label: 'is_custom_height_mode', name: 'is_custom_height_mode', value: '',
    },
    {
      label: 'custom-height', name: 'custom-height', value: '',
    },
    {
      label: 'title', name: 'title', value: '', visible: true,
    },
    {
      label: 'headline_new', name: 'headline_new', value: '', visible: true,
    },
    {
      label: 'headline-size', name: 'headline-size', value: '', visible: true,
    },
    {
      label: 'subtitle', name: 'subtitle', value: '', visible: true,
    },
    {
      label: 'text', name: 'text', value: '', visible: true,
    },
    {
      label: 'image', name: 'image', value: '', visible: true,
    },
    {
      label: 'image-title', name: 'image-title', value: '', visible: false,
    },
    {
      label: 'link', name: 'link', value: '', visible: false,
    },
    {
      label: 'link-target', name: 'link-target', value: '', visible: false,
    },
    {
      label: 'link-label', name: 'link-label', value: '', visible: false,
    },
    {
      label: 'link-style', name: 'link-style', value: '', visible: false,
    },
    {
      label: 'link-aria-label', name: 'link-aria-label', value: '', visible: false,
    },
    {
      label: 'link-2', name: 'link-2', value: '', visible: false,
    },
    {
      label: 'link-2-target', name: 'link-2-target', value: '', visible: false,
    },
    {
      label: 'link-2-label', name: 'link-2-label', value: '', visible: false,
    },
    {
      label: 'link-2-style', name: 'link-2-style', value: '', visible: false,
    },
    {
      label: 'link-2-aria-label', name: 'link-2-aria-label', value: '', visible: false,
    },
    {
      label: 'link-3', name: 'link-3', value: '', visible: false,
    },
    {
      label: 'link-3-target', name: 'link-3-target', value: '', visible: false,
    },
    {
      label: 'link-3-label', name: 'link-3-label', value: '', visible: false,
    },
    {
      label: 'link-3-style', name: 'link-3-style', value: '', visible: false,
    },
    {
      label: 'link-3-aria-label', name: 'link-3-aria-label', value: '', visible: false,
    },
    {
      label: 'link-4', name: 'link-4', value: '', visible: false,
    },
    {
      label: 'link-4-target', name: 'link-4-target', value: '', visible: false,
    },
    {
      label: 'link-4-label', name: 'link-4-label', value: '', visible: false,
    },
    {
      label: 'link-4-style', name: 'link-4-style', value: '', visible: false,
    },
    {
      label: 'link-4-aria-label', name: 'link-4-aria-label', value: '', visible: false,
    },
    {
      label: 'margin-top', name: 'margin-top', value: '', visible: false,
    },
    {
      label: 'margin-bottom', name: 'margin-bottom', value: '', visible: false,
    },
  ];

  setOptions(block, heroOptions);
  setMargin(block, heroOptions);
  setBlockId(block, heroOptions);

  blockWrappers.forEach((element, index) => {
  // Add data-fields/classes according the model
    setAttributesFromModel(element, heroOptions, index);
  });

  const titleDiv = getNodeByOptions('title', block, heroOptions);
  const subtitleDiv = getNodeByOptions('subtitle', block, heroOptions);
  const backgroundImageDiv = getNodeByOptions('image', block, heroOptions);
  const textDiv = getNodeByOptions('text', block, heroOptions);
  const heroOptionDiv = getNodeByOptions('hero-option', block, heroOptions);
  const layoutDiv = getNodeByOptions('layout', block, heroOptions);
  const isCustomHeightModeDiv = getNodeByOptions('is_custom_height_mode', block, heroOptions);
  const customHeightDiv = getNodeByOptions('custom-height', block, heroOptions);
  const imageTitleDiv = getNodeByOptions('image-title', block, heroOptions);
  const headlineNewDiv = getNodeByOptions('headline_new', block, heroOptions);
  const headlineSizeDiv = getNodeByOptions('headline-size', block, heroOptions);

  backgroundImageDiv?.querySelector('img')?.setAttribute('title', imageTitleDiv?.textContent.trim());

  const heroOption = heroOptionDiv?.textContent.trim();
  const layout = layoutDiv?.textContent.trim();
  const headlineSize = headlineSizeDiv?.textContent.trim();

  // Create button configurations using a loop
  let buttons = [];
  for (let i = 1; i <= 4; i += 1) {
    const suffix = i === 1 ? '' : `-${i}`;
    const urlDiv = getNodeByOptions(`link${suffix}`, block, heroOptions);
    const targetDiv = getNodeByOptions(`link${suffix}-target`, block, heroOptions);
    const buttonTextDiv = getNodeByOptions(`link${suffix}-label`, block, heroOptions);
    const styleDiv = getNodeByOptions(`link${suffix}-style`, block, heroOptions);
    const ariaLabelDiv = getNodeByOptions(`link${suffix}-aria-label`, block, heroOptions);

    const buttonConfig = {
      url: urlDiv?.textContent.trim(),
      target: targetDiv?.textContent.trim(),
      text: buttonTextDiv?.textContent.trim(),
      style: styleDiv?.textContent.trim(),
      ariaLabel: ariaLabelDiv?.textContent.trim(),
    };

    // Only add button if it has a URL and text
    if (buttonConfig.url && buttonConfig.text) {
      buttons.push(buttonConfig);
    }
  }

  block.classList.add(layout);
  const isHeroLevel1 = block.classList.contains('hero-level_1');
  const isHeroLevel2 = block.classList.contains('hero-level_2');
  const isHeroLevel3 = block.classList.contains('hero-level_3');
  const isHeroLevel4 = block.classList.contains('hero-level_4');

  if (isHeroLevel2) block.classList.add(heroOption);

  const isCustomHeightMode = isCustomHeightModeDiv?.textContent.trim();
  const customHeight = customHeightDiv?.textContent.trim();
  if (isHeroLevel3 && isCustomHeightMode === 'true') {
    block.style.height = `${customHeight}px`;
    block.classList.add('custom-height');
  }

  applyButtonPlaceholderRendering(textDiv);

  if (isHeroLevel2 || isHeroLevel3 || isHeroLevel4) {
    // Create divs for the image and the info
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('image-container');

    const infoWrapper = document.createElement('div');
    infoWrapper.classList.add('info-container');

    const textInfoContainer = document.createElement('div');
    textInfoContainer.classList.add('info-text-container');

    // Add the background image to the image container
    if (backgroundImageDiv) {
      imageWrapper.appendChild(backgroundImageDiv);
    }

    if (isHeroLevel3) {
      if (headlineNewDiv) {
        textInfoContainer.appendChild(headlineNewDiv);
      }
    } else if (titleDiv) {
      textInfoContainer.appendChild(titleDiv);
    }
    if (textDiv) textInfoContainer.appendChild(textDiv);

    // add below to have only first button for level 4 and for level 3 all four buttons

    if (buttons.length > 0) {
      if (isHeroLevel4) {
        buttons = buttons.slice(0, 1);
      }
      const heroButtonsContainer = document.createElement('div');
      heroButtonsContainer.classList.add('hero-buttons');

      buttons.forEach((buttonConfig) => {
        const buttonWrapper = document.createElement('div');

        buttonWrapper.setAttribute('data-field', 'button');
        buttonWrapper.insertAdjacentHTML(
          'beforeend',
          buttonTemplate({
            link: buttonConfig.url,
            target: buttonConfig.target,
            linkLabel: buttonConfig.text,
            linkStyle: buttonConfig.style,
            ariaLabel: buttonConfig.ariaLabel,
          }),
        );
        heroButtonsContainer.appendChild(buttonWrapper);
        applyButtonPlaceholderRendering(buttonWrapper);
      });

      textInfoContainer.appendChild(heroButtonsContainer);
    }

    infoWrapper.appendChild(textInfoContainer);

    block.innerHTML = '';
    block.appendChild(infoWrapper);
    block.appendChild(imageWrapper);

    if (block.classList.contains(BACKGROUND_BLOCK_GRAY_CLASS)) {
      infoWrapper.classList.add('text-color-neutral');
    } else if (block.classList.contains(BACKGROUND_BLOCK_BLUE_CLASS)) {
      infoWrapper.classList.add('text-color-neutral-50');
    } else {
      infoWrapper.classList.add('text-color-neutral');
    }
  }

  if (isHeroLevel1) {
    titleDiv?.remove();
    subtitleDiv?.remove();
    textDiv?.remove();
    headlineNewDiv?.remove();
    isCustomHeightModeDiv?.remove();
    customHeightDiv?.remove();
    headlineSizeDiv?.remove();
  }

  if (isHeroLevel2 || isHeroLevel4) updateTitle(titleDiv, subtitleDiv);
  if (isHeroLevel3) {
    updateTitle(headlineNewDiv, subtitleDiv);
    if (headlineSize === 'true') {
      const headlineElements = headlineNewDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, pre');
      headlineElements.forEach((headlineElement) => {
        headlineElement.classList.add('headline-big');
      });
    }
  }

  // Apply height adjustment for hero level 4
  if (isHeroLevel4) {
    adjustHeroLevel4Layout(block);
  }
}

function updateTitle(titleDiv, subtitleDiv) {
  const isEditor = getAemAuthorEnv();
  if (titleDiv && subtitleDiv) {
    if (!isEditor) {
      const styledTitle = extractStyledElement(titleDiv);
      const styledSubtitle = extractStyledElement(subtitleDiv);
      if (styledTitle || styledSubtitle) {
        titleDiv.querySelector('div').innerHTML = `<h1>${styledTitle}<em>${styledSubtitle}</em><div class="subtitle"></div>`;
      }
    } else {
      titleDiv.querySelector('div').innerHTML = `<h1>${titleDiv.textContent.trim()}<br/><em>${subtitleDiv.textContent.trim()}</em><div class="subtitle"></div>`;
    }
  }
}

function extractStyledElement(element) {
  const isEditor = getAemAuthorEnv();
  const matchingTags = element.querySelectorAll('p, h1, h2, h3, h4, h5, h6, strong, pre, em, u');
  const resultContainer = document.createElement('div');
  const tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const hTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  matchingTags.forEach((el) => {
    const tagType = el.tagName.toLowerCase();
    if (el.innerHTML !== '' && el.querySelector('p, strong, pre, em, u') && el.querySelectorAll('p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6').length > 0) {
      const clonedEl = el.cloneNode(true);
      const nestedElements = clonedEl.querySelectorAll('p, strong, pre, em, u');
      nestedElements.forEach((nestedEl) => nestedEl.remove());
      const extractedContent = clonedEl.textContent.trim();
      resultContainer.innerHTML += `${extractedContent} `;
      return;
    }
    if (el.innerHTML !== '' && tags.includes(tagType) && el.querySelectorAll('p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6').length === 0) {
      if (isEditor && hTags.includes(tagType)) {
        resultContainer.innerHTML += '';
      } else {
        resultContainer.innerHTML += `${el?.innerHTML}<br>`;
      }
    }
  });
  return resultContainer.innerHTML;
}
