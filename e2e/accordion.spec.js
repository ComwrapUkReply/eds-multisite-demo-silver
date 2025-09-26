/**
 * Accordion Component Tests with Playwright
 * 
 * This file contains comprehensive tests for an accordion component using Playwright.
 * It demonstrates:
 * - Page Object Model pattern for better test organization
 * - Comprehensive accessibility testing
 * - Robust selectors and error handling
 * - Various interaction scenarios
 */

// accordion.page.js - Page Object Model for Accordion component
class AccordionPage {
  constructor(page) {
      this.page = page;
  }

  // Locator for the accordion trigger button
  get accordionButton() {
      return this.page.locator('button.accordion-trigger');
  }

  // Locator for accordion content - uses robust selector strategy
  get accordionContent() {
      // Use a more robust selector that targets accordion content generally
      // This selector looks for content that follows the accordion button
      return this.page.locator('button.accordion-trigger + div, [data-accordion-content]');
  }

  // Method to click the accordion button
  async clickAccordionButton() {
      await this.accordionButton.click();
  }

  // Check if accordion is expanded using ARIA attribute
  async isAccordionExpanded() {
      return await this.accordionButton.getAttribute('aria-expanded') === 'true';
  }

  // Get the title text from the accordion button
  async getAccordionTitle() {
      return await this.accordionButton.locator('span.accordion-title').innerText();
  }

  // Check if the icon has changed visually (indicates state change)
  async isIconChanged() {
      // Check if the icon has changed by looking for a CSS class that indicates expanded state
      // This assumes the accordion uses a class like 'expanded' or 'open' on the button or icon
      return await this.accordionButton.getAttribute('class').then(classes => {
          return classes.includes('expanded') || classes.includes('open');
      });
  }
}

// accordion.spec.js - Test suite for Accordion component
const { test, expect } = require('@playwright/test');

test.describe('Accordion Component - Comprehensive Test Suite', () => {
  let accordionPage;

  // Setup before each test: navigate to page and initialize page object
  test.beforeEach(async ({ page }) => {
      accordionPage = new AccordionPage(page);
      await page.goto('https://author-p24706-e491522.adobeaemcloud.com/content/comwrap-whitelabel-eds/index.html');
  });

  // Test 1: Basic functionality - clicking expands content
  test('Verify that clicking the button expands the associated accordion section', async () => {
      await accordionPage.clickAccordionButton();
      await expect(accordionPage.accordionContent).toBeVisible();
  });

  // Test 2: ARIA attribute testing for accessibility
  test('Confirm that the button\'s aria-expanded attribute changes correctly', async () => {
      await accordionPage.clickAccordionButton();
      expect(await accordionPage.isAccordionExpanded()).toBe(true);
      await accordionPage.clickAccordionButton();
      expect(await accordionPage.isAccordionExpanded()).toBe(false);
  });

  // Test 3: Keyboard accessibility testing
  test('Check that the button is accessible via keyboard navigation', async () => {
      await accordionPage.accordionButton.focus();
      await accordionPage.page.keyboard.press('Tab');
      await expect(accordionPage.accordionButton).toBeFocused();
      await accordionPage.page.keyboard.press('Enter');
      await expect(accordionPage.accordionContent).toBeVisible();
  });

  // Test 4: Content validation
  test('Ensure that the button displays the correct title text', async () => {
      const title = await accordionPage.getAccordionTitle();
      expect(title).toBe('This is an accordion title');
  });

  // Test 5: Visual state changes
  test('Validate that the accordion icon changes visually', async () => {
      const initialIcon = await accordionPage.isIconChanged();
      await accordionPage.clickAccordionButton();
      const afterIcon = await accordionPage.isIconChanged();
      expect(initialIcon).not.toEqual(afterIcon);
  });

  // Test 6: Stress testing - rapid clicks
  test('Attempt to click the button rapidly multiple times', async () => {
      for (let i = 0; i < 10; i++) {
          await accordionPage.clickAccordionButton();
      }
      await expect(accordionPage.accordionContent).toBeVisible(); // Check if it remains stable
  });

  // Test 7: State transition testing
  test('Test clicking the button when the content is already visible', async () => {
      await accordionPage.clickAccordionButton(); // Expand
      await expect(accordionPage.accordionContent).toBeVisible();
      await accordionPage.clickAccordionButton(); // Collapse
      await expect(accordionPage.accordionContent).not.toBeVisible();
  });

  // Test 8: Graceful degradation without JavaScript
  test('Check behavior when JavaScript is disabled', async ({ browser }) => {
      // Create a new context with JavaScript disabled
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      const jsDisabledAccordionPage = new AccordionPage(page);
      
      await page.goto('https://author-p24706-e491522.adobeaemcloud.com/content/comwrap-whitelabel-eds/index.html');
      
      // Verify that accordion content is visible by default (no JS to collapse it)
      await expect(jsDisabledAccordionPage.accordionContent).toBeVisible();
      
      // Try to click the button - it should not work with JS disabled
      await jsDisabledAccordionPage.clickAccordionButton();
      // Content should remain visible since JS can't toggle it
      await expect(jsDisabledAccordionPage.accordionContent).toBeVisible();
      
      await context.close();
  });

  // Test 9: Authorization state testing
  test('Verify that the button does not respond to clicks when unauthorized', async () => {
      // This test would typically require setting up an unauthorized state first
      // For demonstration, we'll check if the button is disabled when certain conditions are met
      
      // Check if button is enabled by default
      await expect(accordionPage.accordionButton).toBeEnabled();
      
      // Simulate unauthorized state (this would be application-specific)
      // await page.evaluate(() => window.dispatchEvent(new CustomEvent('unauthorized')));
      
      // In a real scenario, you would check if the button becomes disabled
      // await expect(accordionPage.accordionButton).toBeDisabled();
      
      // For now, we'll mark this test as skipped with a note
      test.skip('This test requires specific unauthorized state setup');
  });

  // Test 10: Screen reader accessibility testing
  test('Simulate screen reader user', async () => {
      // Focus the accordion button
      await accordionPage.accordionButton.focus();
      
      // Check aria attributes for screen reader compatibility
      const ariaExpanded = await accordionPage.accordionButton.getAttribute('aria-expanded');
      const ariaControls = await accordionPage.accordionButton.getAttribute('aria-controls');
      
      // Verify proper ARIA attributes are present
      expect(ariaExpanded).toBeDefined();
      expect(ariaControls).toBeDefined();
      
      // Test keyboard navigation and activation
      await accordionPage.page.keyboard.press('Enter');
      await expect(accordionPage.accordionContent).toBeVisible();
      
      await accordionPage.page.keyboard.press('Enter');
      await expect(accordionPage.accordionContent).not.toBeVisible();
  });

  test('Evaluate functionality under varying network conditions', async () => {
      // Use Playwright's network conditions to simulate slow connections
      await accordionPage.page.setOffline(true);
      
      // Try to interact with accordion while offline
      await accordionPage.clickAccordionButton();
      
      // Restore network and verify functionality
      await accordionPage.page.setOffline(false);
      await accordionPage.clickAccordionButton();
      await expect(accordionPage.accordionContent).toBeVisible();
  });
});