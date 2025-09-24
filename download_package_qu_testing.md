# Universal Editor Block Accessibility Framework - Download Package

## 📦 Package Contents

This package contains everything you need to implement accessibility testing for Adobe Universal Editor blocks with Cursor AI integration.

### 🗂️ File Structure
```
ue-accessibility-framework/
├── README.md                           # Setup and usage instructions
├── package.json                        # Dependencies and scripts
├── workflow.sh                         # Development workflow automation
├── cursor-setup/
│   ├── cursor-settings.json            # Cursor IDE settings
│   ├── ue-block-snippet.md             # Cursor snippet for block generation
│   └── cursor-instructions.md          # Custom instructions for Cursor
├── tests/
│   ├── block-a11y-tester.js           # Main accessibility testing framework
│   ├── ue-test-runner.html            # Interactive test runner interface
│   ├── accessibility-framework.js      # Core testing utilities
│   └── example-tests/
│       └── hero-block-test.html        # Example test file
├── blocks/
│   └── hero/                           # Sample hero block with full a11y
│       ├── _hero.json                  # Block definition
│       ├── hero.js                     # Block implementation
│       ├── hero.css                    # Block styles
│       └── hero-test.html              # Block-specific tests
├── docs/
│   ├── installation-guide.md           # Step-by-step installation
│   ├── usage-guide.md                  # How to use the framework
│   ├── testing-guide.md                # Testing methodology
│   ├── cursor-integration.md           # Cursor AI setup guide
│   └── troubleshooting.md              # Common issues and solutions
└── templates/
    ├── block-template.js               # Template for new blocks
    ├── block-template.css              # Template CSS
    ├── block-template.json             # Template JSON definition
    └── test-template.html              # Template test file
```

## 🚀 Quick Start

1. **Download and Extract**
   ```bash
   # Download the package (replace with actual download URL)
   curl -L -o ue-accessibility-framework.zip [DOWNLOAD_URL]
   unzip ue-accessibility-framework.zip
   cd ue-accessibility-framework
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Cursor IDE**
   ```bash
   # Copy Cursor settings (optional)
   cp cursor-setup/cursor-settings.json ~/.cursor/settings.json
   
   # Or manually add the snippet and instructions to Cursor
   # See cursor-setup/README.md for details
   ```

4. **Start Development**
   ```bash
   # Make workflow script executable
   chmod +x workflow.sh
   
   # Set up project structure
   ./workflow.sh setup
   
   # Start development server
   ./workflow.sh serve
   ```

5. **Create Your First Block**
   ```bash
   # Using the workflow script
   ./workflow.sh create "My Awesome Block"
   
   # Or in Cursor, type: ue-block-a11y
   ```

6. **Test Your Block**
   - Open http://localhost:3000/tests/ue-test-runner.html
   - Load your block files
   - Run accessibility tests
   - Review results and iterate

## 📋 Package Files

### Core Framework Files

#### `package.json`
```json
{
  "name": "ue-accessible-blocks-testing",
  "version": "1.0.0",
  "description": "Accessibility testing framework for Adobe Universal Editor blocks",
  "scripts": {
    "serve": "http-server -p 3000 -c-1 --cors",
    "test:a11y": "pa11y http://localhost:3000/tests/ue-test-runner.html",
    "test:block": "echo 'Open http://localhost:3000/tests/ue-test-runner.html'",
    "start": "npm run serve"
  },
  "devDependencies": {
    "@web/test-runner": "^0.18.0",
    "http-server": "^14.1.1",
    "pa11y": "^7.0.0"
  },
  "dependencies": {
    "axe-core": "^4.8.2"
  }
}
```

#### `tests/block-a11y-tester.js`
The main accessibility testing framework class (UniversalEditorBlockTester) - see previous artifact.

#### `tests/ue-test-runner.html`
Interactive web interface for testing blocks - see previous artifact.

#### `workflow.sh`
Development automation script - see previous artifact.

### Cursor Integration Files

#### `cursor-setup/cursor-instructions.md`
```markdown
# Cursor IDE Instructions for Universal Editor Blocks

Add these instructions to your Cursor IDE settings:

When creating blocks for Adobe Universal Editor:

1. ALWAYS follow the Universal Editor block architecture:
   - _blockname.json for block definition and content model
   - blockname.js with export default function decorate(block)
   - blockname.css following Universal Editor CSS patterns

2. Include comprehensive accessibility features:
   - Semantic HTML structure
   - ARIA attributes and roles
   - Keyboard navigation (Tab, Enter, Escape, Arrow keys)
   - Focus management
   - Screen reader compatibility

3. Create accessibility test suite that integrates with the block's decorate function

4. Follow Universal Editor best practices:
   - Progressive enhancement
   - Block options via CSS classes
   - Event delegation patterns
   - Performance optimization

5. Always test mouse, keyboard, and screen reader interactions
```

#### `cursor-setup/ue-block-snippet.md`
```markdown
# Cursor Snippet: ue-block-a11y

**Trigger:** `ue-block-a11y`

**Template:**
```
Create a ${1:BlockName} block for Adobe Universal Editor with comprehensive accessibility testing:

UNIVERSAL EDITOR REQUIREMENTS:
- Follow Universal Editor block architecture exactly
- Use export default function decorate(block) pattern
- Progressive enhancement approach
- Block options via CSS classes detection
- Semantic HTML structure with proper ARIA

BLOCK FILES TO GENERATE:
1. _${2:blockname}.json - Block definition with fields and options
2. ${2:blockname}.js - Block decoration with accessibility features  
3. ${2:blockname}.css - Accessible styling with focus indicators
4. ${2:blockname}-test.html - Test runner for accessibility testing

[Full template content from previous artifact]
```

### Documentation Files

#### `README.md`
```markdown
# Universal Editor Block Accessibility Framework

A comprehensive testing framework for creating accessible Adobe Universal Editor blocks with Cursor AI integration.

## Features

- 🧪 **Comprehensive Testing**: Tests mouse, keyboard, and screen reader interactions
- 🤖 **AI Integration**: Custom Cursor snippets for generating accessible blocks
- 🎯 **Universal Editor Compatible**: Works with vanilla HTML/CSS/JavaScript
- ⚡ **Real-time Testing**: Interactive test runner with immediate feedback
- 📊 **Detailed Reports**: Exportable accessibility reports
- 🔄 **Development Workflow**: Automated setup and testing scripts

## Quick Start

1. Install dependencies: `npm install`
2. Set up Cursor integration (see cursor-setup/)
3. Start development: `./workflow.sh serve`
4. Create blocks: Type `ue-block-a11y` in Cursor
5. Test blocks: Visit http://localhost:3000/tests/ue-test-runner.html

## Documentation

- [Installation Guide](docs/installation-guide.md)
- [Usage Guide](docs/usage-guide.md)
- [Testing Guide](docs/testing-guide.md)
- [Cursor Integration](docs/cursor-integration.md)
- [Troubleshooting](docs/troubleshooting.md)

## Support

For issues and questions, please check the troubleshooting guide or create an issue.
```

#### `docs/installation-guide.md`
```markdown
# Installation Guide

## Prerequisites

- Node.js 16+ and npm
- Cursor IDE (recommended)
- Modern web browser for testing

## Step-by-Step Installation

### 1. Download and Extract

Download the framework package and extract it to your project directory.

### 2. Install Dependencies

```bash
cd ue-accessibility-framework
npm install
```

### 3. Set Up Cursor IDE (Optional but Recommended)

#### Option A: Automatic Setup
```bash
cp cursor-setup/cursor-settings.json ~/.cursor/settings.json
```

#### Option B: Manual Setup
1. Open Cursor IDE
2. Go to Settings (Ctrl/Cmd + ,)
3. Add the custom instructions from `cursor-setup/cursor-instructions.md`
4. Add the snippet from `cursor-setup/ue-block-snippet.md`

### 4. Verify Installation

```bash
# Make workflow script executable
chmod +x workflow.sh

# Run setup
./workflow.sh setup

# Start development server
./workflow.sh serve
```

Visit http://localhost:3000/tests/ue-test-runner.html to verify the test runner loads correctly.

### 5. Test with Sample Block

The package includes a sample hero block. Test it by:

1. Opening http://localhost:3000/blocks/hero/hero-test.html
2. Checking the console for test results
3. Using the main test runner to load the hero block files

## Troubleshooting Installation

See [troubleshooting.md](troubleshooting.md) for common installation issues.
```

#### `docs/usage-guide.md`
```markdown
# Usage Guide

## Creating Accessible Blocks with Cursor

### Method 1: Using the Cursor Snippet

1. In Cursor IDE, create a new file
2. Type `ue-block-a11y`
3. Fill in the block name when prompted
4. Let Cursor generate all the block files
5. Review and customize the generated code

### Method 2: Using the Workflow Script

```bash
./workflow.sh create "Button Component"
```

This creates a complete block structure with:
- JSON definition file
- JavaScript implementation with accessibility features
- CSS with focus indicators and responsive design
- HTML test file

## Testing Your Blocks

### Interactive Testing

1. Start the development server: `./workflow.sh serve`
2. Open http://localhost:3000/tests/ue-test-runner.html
3. Upload your block files (JS, CSS, HTML)
4. Configure block options
5. Run accessibility tests
6. Review results and export reports

### Automated Testing

```bash
# Run Pa11y tests on all blocks
./workflow.sh test

# Test specific block
npx pa11y http://localhost:3000/blocks/your-block/your-block-test.html
```

### Manual Testing

Each block includes a test HTML file for manual testing:

```bash
# Open block-specific test file
open blocks/your-block/your-block-test.html
```

## Block Development Workflow

1. **Plan**: Define block requirements and accessibility needs
2. **Generate**: Use Cursor snippet to create initial structure
3. **Implement**: Add business logic while maintaining accessibility
4. **Test**: Use test runner to validate accessibility
5. **Iterate**: Fix issues based on test feedback
6. **Deploy**: Release with confidence

## Understanding Test Results

### Success Rates
- **90%+**: Excellent accessibility - ready for production
- **70-89%**: Good accessibility - minor improvements needed
- **<70%**: Significant accessibility issues - requires attention

### Test Categories
- **Structure**: Universal Editor architecture compliance
- **Mouse**: Click interactions and hover states
- **Keyboard**: Tab navigation and keyboard shortcuts
- **Screen Reader**: ARIA implementation and semantic structure
- **Visual**: Focus indicators and contrast
- **Performance**: Loading and rendering optimization

## Best Practices

### Block Structure
- Always use semantic HTML elements
- Implement proper heading hierarchy
- Add ARIA attributes only when necessary
- Ensure logical tab order

### JavaScript Implementation
- Use progressive enhancement
- Handle keyboard events properly
- Manage focus appropriately
- Provide error handling

### CSS Guidelines
- Include visible focus indicators
- Support reduced motion preferences
- Ensure sufficient color contrast
- Implement responsive design

### Testing Strategy
- Test with keyboard only
- Use screen reader software when possible
- Test across different devices and browsers
- Validate with automated tools

## Common Patterns

See the sample hero block (`blocks/hero/`) for examples of:
- Block options handling
- Image accessibility
- Button and link implementation
- Responsive design
- Animation with reduced motion support
```

### Template Files

#### `templates/block-template.js`
```javascript
/**
 * {{BLOCK_NAME}} Block - Accessible implementation for Universal Editor
 * {{BLOCK_DESCRIPTION}}
 */

export default function decorate(block) {
  // Process block content
  processBlockContent(block);
  
  // Add accessibility features
  enhanceAccessibility(block);
  
  // Add interactions
  addEventListeners(block);
  
  // Initialize features based on options
  initializeBlockFeatures(block);
}

/**
 * Process and enhance block content
 * @param {HTMLElement} block - The block DOM element
 */
function processBlockContent(block) {
  // TODO: Implement content processing
  // Example: const [titleDiv, descriptionDiv] = block.children;
}

/**
 * Enhance accessibility features
 * @param {HTMLElement} block - The block DOM element
 */
function enhanceAccessibility(block) {
  // TODO: Add ARIA labels, roles, and other accessibility features
  block.setAttribute('role', 'region');
}

/**
 * Add event listeners for interactive features
 * @param {HTMLElement} block - The block DOM element
 */
function addEventListeners(block) {
  // TODO: Add event listeners for interactive elements
}

/**
 * Initialize block features based on options
 * @param {HTMLElement} block - The block DOM element
 */
function initializeBlockFeatures(block) {
  const options = getBlockOptions(block);
  // TODO: Handle different block options
}

/**
 * Get active block options from CSS classes
 * @param {HTMLElement} block - The block DOM element
 * @returns {string[]} Array of active option classes
 */
function getBlockOptions(block) {
  return [...block.classList].filter(c => 
    !['block', '{{BLOCK_ID}}'].includes(c)
  );
}
```

## 📥 Download Instructions

To create this package for download:

1. **Create the directory structure** with all files listed above
2. **Package as ZIP file**:
   ```bash
   zip -r ue-accessibility-framework.zip ue-accessibility-framework/
   ```
3. **Host the ZIP file** on your preferred platform (GitHub releases, file hosting service, etc.)

## 📋 Checklist for Package Creation

- [ ] All framework files included
- [ ] Cursor integration files set up
- [ ] Documentation complete
- [ ] Sample blocks included
- [ ] Templates provided
- [ ] Installation scripts working
- [ ] README with quick start guide
- [ ] Package tested on clean system

This package provides everything needed to implement comprehensive accessibility testing for Universal Editor blocks with seamless Cursor AI integration!