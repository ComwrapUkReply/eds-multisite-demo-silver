/**
 * Profiles Container Block Implementation
 * Creates a container for multiple profile items with horizontal layout
 * Based on Figma design with circular profile images and author information
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Process individual profile item content
 * @param {HTMLElement} profileItem - The profile item element
 */
function processProfileItem(profileItem) {
  const config = {
    selectors: {
      image: 'picture',
      content: ':scope > div:last-child',
      authorName: 'h1, h2, h3, h4, h5, h6',
      authorTitle: 'p:first-of-type',
      authorBio: 'p:last-of-type',
    },
    classes: {
      profileItem: 'profiles-container-profile-item',
      profileImage: 'profiles-container-profile-image',
      profileContent: 'profiles-container-profile-content',
      authorName: 'profiles-container-author-name',
      authorTitle: 'profiles-container-author-title',
      authorBio: 'profiles-container-author-bio',
    },
  };

  // Add semantic classes to profile item
  profileItem.classList.add(config.classes.profileItem);

  // Process image
  const imageElement = profileItem.querySelector(config.selectors.image);
  if (imageElement) {
    imageElement.classList.add(config.classes.profileImage);

    // Optimize image
    const img = imageElement.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(
        img.src,
        img.alt || 'Profile image',
        false,
        [{ width: '120' }],
      );
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      img.closest('picture').replaceWith(optimizedPic);
    }
  }

  // Process content area
  const contentDiv = profileItem.querySelector(config.selectors.content);
  if (contentDiv) {
    contentDiv.classList.add(config.classes.profileContent);

    // Process author name (heading)
    const authorName = contentDiv.querySelector(config.selectors.authorName);
    if (authorName) {
      authorName.classList.add(config.classes.authorName);

      // Wrap author name in link if it contains a link
      const link = authorName.querySelector('a');
      if (link) {
        // Author name is already a link, keep as is
        authorName.innerHTML = link.outerHTML;
      } else {
        // Create link from author name text
        const authorText = authorName.textContent.trim();
        if (authorText) {
          authorName.innerHTML = `<a href="#" title="View profile of ${authorText}">${authorText}</a>`;
        }
      }
    }

    // Process author title
    const authorTitle = contentDiv.querySelector(config.selectors.authorTitle);
    if (authorTitle) {
      authorTitle.classList.add(config.classes.authorTitle);
    }

    // Process author bio
    const authorBio = contentDiv.querySelector(config.selectors.authorBio);
    if (authorBio && authorBio !== authorTitle) {
      authorBio.classList.add(config.classes.authorBio);
    }
  }
}


/**
 * Add accessibility features to the profiles container
 * @param {HTMLElement} block - The block element
 */
function addAccessibilityFeatures(block) {
  const config = {
    selectors: {
      profileItems: 'ul li',
      profileImages: '.profiles-container-profile-image img',
      profileLinks: '.profiles-container-author-name a',
    },
  };

  // Add ARIA labels to profile images
  const profileImages = block.querySelectorAll(config.selectors.profileImages);
  profileImages.forEach((img, index) => {
    if (!img.getAttribute('aria-label') && !img.getAttribute('alt')) {
      img.setAttribute('aria-label', `Profile image ${index + 1}`);
    }
  });

  // Add ARIA attributes to profile items
  const profileItems = block.querySelectorAll(config.selectors.profileItems);
  profileItems.forEach((item, index) => {
    item.setAttribute('role', 'listitem');
    item.setAttribute('aria-label', `Profile ${index + 1}`);
  });

  // Ensure profile links are keyboard accessible
  const profileLinks = block.querySelectorAll(config.selectors.profileLinks);
  profileLinks.forEach((link) => {
    if (!link.getAttribute('tabindex')) {
      link.setAttribute('tabindex', '0');
    }

    // Add keyboard navigation
    link.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        link.click();
      }
    });
  });
}


/**
 * Add analytics tracking to profile interactions
 * @param {HTMLElement} block - The block element
 */
function addAnalyticsTracking(block) {
  const config = {
    selectors: {
      profileLinks: '.profiles-container-author-name a',
    },
  };

  const profileLinks = block.querySelectorAll(config.selectors.profileLinks);
  profileLinks.forEach((link, index) => {
    link.addEventListener('click', () => {
      // Track profile click
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'profile_interaction',
          block_type: 'profiles-container',
          action: 'profile_click',
          profile_index: index + 1,
          profile_name: link.textContent.trim(),
        });
      }
    });
  });
}


/**
 * Main decoration function for the profiles container block
 * @param {HTMLElement} block - The block DOM element
 */
export default function decorate(block) {
  // Check if block exists
  if (!block) return;

  const config = {
    selectors: {
      profileItems: ':scope > div',
    },
    classes: {
      container: 'profiles-container',
      list: 'profiles-container-list',
    },
  };

  // Create unordered list for profile items
  const ul = document.createElement('ul');
  ul.classList.add(config.classes.list);

  // Process each profile item
  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    li.setAttribute('data-profile-index', index);

    // Move instrumentation from row to li
    moveInstrumentation(row, li);

    // Move all children from row to li
    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }

    // Process the profile item content
    processProfileItem(li);

    // Add to list
    ul.append(li);
  });

  // Clear block content and add the list
  block.textContent = '';
  block.classList.add(config.classes.container);
  block.append(ul);

  // Add accessibility features
  addAccessibilityFeatures(block);

  // Add analytics tracking
  addAnalyticsTracking(block);
}


