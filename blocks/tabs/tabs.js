import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Generates a unique ID for tab panels and buttons
 * @returns {string} Unique identifier
 */
const generateUniqueId = () => `tab-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Decorates the tabs block
 * @param {Element} block - The block element
 */
export default async function decorate(block) {
  // Configuration
  const config = {
    activeClass: 'active',
    tabButtonClass: 'tabs-tab-button',
    tabPanelClass: 'tabs-tab-panel',
  };

  // Create tabs container structure
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'tabs-container';

  // Create tab list (vertical buttons on the left)
  const tabList = document.createElement('div');
  tabList.className = 'tabs-tab-list';
  tabList.setAttribute('role', 'tablist');
  tabList.setAttribute('aria-label', 'Content tabs');

  // Create indicator line
  const indicator = document.createElement('div');
  indicator.className = 'tabs-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  tabList.appendChild(indicator);

  // Create tab buttons wrapper
  const tabButtonsWrapper = document.createElement('div');
  tabButtonsWrapper.className = 'tabs-tab-buttons-wrapper';
  tabList.appendChild(tabButtonsWrapper);

  // Create tab panels container (content area on the right)
  const tabPanelsContainer = document.createElement('div');
  tabPanelsContainer.className = 'tabs-tab-panels';

  // Extract tabs from block structure
  const tabs = [...block.children].map((row, index) => {
    const cells = [...row.children];
    const titleCell = cells[0];
    const contentCell = cells[1];

    if (!titleCell || !contentCell) {
      return null;
    }

    const uniqueId = generateUniqueId();
    const title = titleCell.textContent.trim();
    const isActive = index === 0;

    // Create tab button
    const button = document.createElement('button');
    button.className = config.tabButtonClass;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', isActive);
    button.setAttribute('aria-controls', uniqueId);
    button.setAttribute('id', `${uniqueId}-button`);
    button.setAttribute('type', 'button');
    button.tabIndex = isActive ? 0 : -1;

    // Create button content wrapper
    const buttonContent = document.createElement('span');
    buttonContent.className = 'tabs-tab-button-content';
    buttonContent.textContent = title;
    button.appendChild(buttonContent);

    if (isActive) {
      button.classList.add(config.activeClass);
    }

    moveInstrumentation(row, button);

    // Create tab panel
    const panel = document.createElement('div');
    panel.className = config.tabPanelClass;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('id', uniqueId);
    panel.setAttribute('aria-labelledby', `${uniqueId}-button`);
    panel.tabIndex = 0;

    if (!isActive) {
      panel.setAttribute('hidden', '');
    } else {
      panel.classList.add(config.activeClass);
    }

    // Transfer content to panel
    panel.innerHTML = contentCell.innerHTML;

    return {
      button,
      panel,
      uniqueId,
    };
  }).filter(Boolean);

  // Add buttons and panels to their containers
  tabs.forEach(({ button, panel }) => {
    tabButtonsWrapper.appendChild(button);
    tabPanelsContainer.appendChild(panel);
  });

  // Position indicator on initial active tab
  const updateIndicator = (activeButton) => {
    const buttonRect = activeButton.getBoundingClientRect();
    const { offsetTop: top } = activeButton;
    const { height } = buttonRect;

    indicator.style.top = `${top}px`;
    indicator.style.height = `${height}px`;
  };

  // Switch tab function
  const switchTab = (fromButton, toButton) => {
    const fromPanel = document.getElementById(fromButton.getAttribute('aria-controls'));
    const toPanel = document.getElementById(toButton.getAttribute('aria-controls'));

    // Update buttons
    fromButton.setAttribute('aria-selected', 'false');
    fromButton.classList.remove(config.activeClass);
    fromButton.tabIndex = -1;

    toButton.setAttribute('aria-selected', 'true');
    toButton.classList.add(config.activeClass);
    toButton.tabIndex = 0;
    toButton.focus();

    // Update panels
    fromPanel.setAttribute('hidden', '');
    fromPanel.classList.remove(config.activeClass);

    toPanel.removeAttribute('hidden');
    toPanel.classList.add(config.activeClass);

    // Update indicator
    updateIndicator(toButton);
  };

  // Add click event listeners to tab buttons
  tabs.forEach(({ button }) => {
    button.addEventListener('click', () => {
      const currentActiveButton = tabButtonsWrapper.querySelector(`.${config.tabButtonClass}.${config.activeClass}`);
      if (currentActiveButton !== button) {
        switchTab(currentActiveButton, button);
      }
    });
  });

  // Keyboard navigation
  tabButtonsWrapper.addEventListener('keydown', (event) => {
    const currentButton = event.target;
    if (!currentButton.classList.contains(config.tabButtonClass)) {
      return;
    }

    const buttons = [...tabButtonsWrapper.querySelectorAll(`.${config.tabButtonClass}`)];
    const currentIndex = buttons.indexOf(currentButton);
    let nextIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % buttons.length;
        switchTab(currentButton, buttons[nextIndex]);
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        switchTab(currentButton, buttons[nextIndex]);
        break;

      case 'Home':
        event.preventDefault();
        switchTab(currentButton, buttons[0]);
        break;

      case 'End':
        event.preventDefault();
        switchTab(currentButton, buttons[buttons.length - 1]);
        break;

      default:
        break;
    }
  });

  // Assemble the tabs structure
  tabsContainer.appendChild(tabList);
  tabsContainer.appendChild(tabPanelsContainer);

  // Replace block content
  block.textContent = '';
  block.appendChild(tabsContainer);

  // Position indicator after render
  requestAnimationFrame(() => {
    const activeButton = tabButtonsWrapper.querySelector(`.${config.tabButtonClass}.${config.activeClass}`);
    if (activeButton) {
      updateIndicator(activeButton);
    }
  });
}
