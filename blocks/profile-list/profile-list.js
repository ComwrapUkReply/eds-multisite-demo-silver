import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const PROFILE_LIST_CONFIG = {
  IMAGE_WIDTHS: [{ width: '200' }, { width: '400' }, { width: '600' }],
  GRID_COLUMNS: {
    mobile: 1,
    tablet: 2,
    desktop: 3
  }
};

/**
 * Profile List block implementation
 * Displays a grid of profile cards with images and information
 */
export default function decorate(block) {
  const rows = [...block.children];

  if (rows.length === 0) return;

  // Clear block content
  block.textContent = '';

  // Create profile list container
  const profileListContainer = document.createElement('div');
  profileListContainer.className = 'profile-list-container';

  // Create profile list wrapper
  const profileListWrapper = document.createElement('div');
  profileListWrapper.className = 'profile-list-wrapper';

  // Process each row as a profile item
  rows.forEach((row, index) => {
    const profileItem = createProfileItem(row, index);
    if (profileItem) {
      profileListWrapper.appendChild(profileItem);
    }
  });

  profileListContainer.appendChild(profileListWrapper);
  block.appendChild(profileListContainer);

  // Add responsive grid classes
  addResponsiveClasses(profileListWrapper);

  // Move instrumentation from first row
  if (rows.length > 0) {
    moveInstrumentation(rows[0], block);
  }
}

/**
 * Create a profile item from a row
 * @param {HTMLElement} row - The row element containing profile data
 * @param {number} index - The index of the profile item
 * @returns {HTMLElement|null} The created profile item element
 */
function createProfileItem(row, index) {
  const cells = [...row.children];
  
  if (cells.length === 0) return null;

  // Create profile item container
  const profileItem = document.createElement('div');
  profileItem.className = 'profile-item';
  profileItem.setAttribute('data-index', index);

  // Extract profile data from cells
  const profileData = extractProfileData(cells);

  // Create profile card
  const profileCard = createProfileCard(profileData);
  profileItem.appendChild(profileCard);

  return profileItem;
}

/**
 * Extract profile data from table cells
 * @param {HTMLElement[]} cells - Array of table cells
 * @returns {Object} Profile data object
 */
function extractProfileData(cells) {
  const profileData = {
    image: null,
    imageAlt: '',
    name: '',
    title: '',
    department: '',
    email: '',
    phone: '',
    bio: '',
    classes: []
  };

  cells.forEach((cell) => {
    const elements = [...cell.children];
    
    // Handle cell with direct text content
    if (elements.length === 0 && cell.textContent.trim()) {
      const textContent = cell.textContent.trim();
      if (!profileData.name && textContent) {
        profileData.name = textContent;
      }
      return;
    }

    // Process child elements
    elements.forEach((element) => {
      // Find images
      const img = element.querySelector('img') || (element.tagName === 'IMG' ? element : null);
      const picture = element.querySelector('picture') || (element.tagName === 'PICTURE' ? element : null);

      if ((img || picture) && !profileData.image) {
        profileData.image = img || picture.querySelector('img');
        profileData.imageAlt = profileData.image.alt || '';
        return;
      }

      // Find text content for profile information
      if (element.tagName === 'DIV' || element.tagName === 'P') {
        const textContent = element.textContent?.trim();
        if (textContent) {
          // Try to identify the type of content based on patterns
          if (textContent.includes('@') && !profileData.email) {
            profileData.email = textContent;
          } else if (textContent.match(/^[\+]?[1-9][\d]{0,15}$/) && !profileData.phone) {
            profileData.phone = textContent;
          } else if (textContent.length > 50 && !profileData.bio) {
            profileData.bio = textContent;
          } else if (!profileData.name) {
            profileData.name = textContent;
          }
          return;
        }
      }

      // Find links (profile name might be in a link)
      const link = element.querySelector('a');
      if (link && !profileData.name) {
        const linkText = link.textContent?.trim();
        if (linkText) {
          profileData.name = linkText;
          return;
        }
      }
    });
  });

  return profileData;
}

/**
 * Create a profile card element
 * @param {Object} profileData - Profile data object
 * @returns {HTMLElement} Profile card element
 */
function createProfileCard(profileData) {
  const profileCard = document.createElement('div');
  profileCard.className = 'profile-card';

  // Create image container
  if (profileData.image) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'profile-card-image';

    const optimizedPicture = createOptimizedPicture(
      profileData.image.src,
      profileData.imageAlt || 'Profile image',
      false,
      PROFILE_LIST_CONFIG.IMAGE_WIDTHS,
    );

    moveInstrumentation(profileData.image, optimizedPicture.querySelector('img'));
    imageContainer.appendChild(optimizedPicture);
    profileCard.appendChild(imageContainer);
  }

  // Create content container
  const contentContainer = document.createElement('div');
  contentContainer.className = 'profile-card-content';

  // Add name
  if (profileData.name) {
    const nameElement = document.createElement('h3');
    nameElement.className = 'profile-card-name';
    nameElement.textContent = profileData.name;
    contentContainer.appendChild(nameElement);
  }

  // Add title
  if (profileData.title) {
    const titleElement = document.createElement('p');
    titleElement.className = 'profile-card-title';
    titleElement.textContent = profileData.title;
    contentContainer.appendChild(titleElement);
  }

  // Add department
  if (profileData.department) {
    const departmentElement = document.createElement('p');
    departmentElement.className = 'profile-card-department';
    departmentElement.textContent = profileData.department;
    contentContainer.appendChild(departmentElement);
  }

  // Add bio
  if (profileData.bio) {
    const bioElement = document.createElement('p');
    bioElement.className = 'profile-card-bio';
    bioElement.textContent = profileData.bio;
    contentContainer.appendChild(bioElement);
  }

  // Add contact information
  const contactContainer = document.createElement('div');
  contactContainer.className = 'profile-card-contact';

  if (profileData.email) {
    const emailElement = document.createElement('a');
    emailElement.className = 'profile-card-email';
    emailElement.href = `mailto:${profileData.email}`;
    emailElement.textContent = profileData.email;
    contactContainer.appendChild(emailElement);
  }

  if (profileData.phone) {
    const phoneElement = document.createElement('a');
    phoneElement.className = 'profile-card-phone';
    phoneElement.href = `tel:${profileData.phone}`;
    phoneElement.textContent = profileData.phone;
    contactContainer.appendChild(phoneElement);
  }

  if (contactContainer.children.length > 0) {
    contentContainer.appendChild(contactContainer);
  }

  profileCard.appendChild(contentContainer);

  // Add classes based on profile data
  if (profileData.classes && profileData.classes.length > 0) {
    profileData.classes.forEach(cls => {
      profileCard.classList.add(`profile-card-${cls}`);
    });
  }

  return profileCard;
}

/**
 * Add responsive classes to profile list wrapper
 * @param {HTMLElement} wrapper - The profile list wrapper element
 */
function addResponsiveClasses(wrapper) {
  const profileItems = wrapper.querySelectorAll('.profile-item');
  const itemCount = profileItems.length;

  // Add responsive grid classes based on item count
  if (itemCount <= 1) {
    wrapper.classList.add('profile-list-single');
  } else if (itemCount <= 2) {
    wrapper.classList.add('profile-list-double');
  } else if (itemCount <= 3) {
    wrapper.classList.add('profile-list-triple');
  } else {
    wrapper.classList.add('profile-list-multiple');
  }

  // Add grid layout class
  wrapper.classList.add('profile-list-grid');
}
