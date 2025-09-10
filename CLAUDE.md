# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Lint JavaScript**: `npm run lint:js` - ESLint checking for `.js`, `.json`, `.mjs` files
- **Lint CSS**: `npm run lint:css` - Stylelint for block CSS and global styles
- **Lint All**: `npm run lint` - Run both JS and CSS linting
- **Fix Linting**: `npm run lint:fix` - Auto-fix linting issues
- **Build Components**: `npm run build:json` - Generate component definition files for AEM Universal Editor
  - `npm run build:json:models` - Build component models
  - `npm run build:json:definitions` - Build component definitions  
  - `npm run build:json:filters` - Build component filters
- **Install Dependencies**: `npm i`
- **Local Development**: Use `aem up` after installing AEM CLI (`npm install -g @adobe/aem-cli`)

## Project Architecture

This is an **Adobe Edge Delivery Services (AEM Live)** project using the Universal Editor for content authoring. It follows a buildless approach where code runs directly from GitHub.

### Core Structure

- **blocks/**: Custom UI components (hero, teaser, cards, etc.)
  - Each block has `.js`, `.css`, and optional `_blockname.json` definition files
  - Block definitions follow the Universal Editor component model
- **models/**: Base component models and definitions for Universal Editor
- **scripts/**: Global JavaScript functionality
  - `scripts.js` - Main entry point
  - `aem.js` - AEM-specific utilities
  - `language-config.js` & `language-mapping.js` - Multi-language support
- **styles/**: Global CSS and theming
  - `styles.css` - Critical path styles
  - `palette.css` & `palette-variables.css` - Color theming system
- **tools/**: Development and import utilities
  - `importer/` - Content import tools for migrating content

### Universal Editor Integration

Components are defined through JSON configuration files that get merged into:
- `component-definition.json` - Component registry
- `component-models.json` - Field definitions for authoring
- `component-filters.json` - Controls component nesting

### Content Authoring

Content is authored through AEM Cloud Service and delivered via:
- **Preview**: `https://main--{repo}--{owner}.aem.page/`
- **Live**: `https://main--{repo}--{owner}.aem.live/`
- Content source configured in `fstab.yaml`

### Multi-language Support

The project includes sophisticated language handling:
- Language switcher component
- Configuration-driven language mappings
- URL-based language routing

### Key Development Patterns

1. **Block Development**: Follow the three-phase approach outlined in Cursor rules
   - Phase 1: Define component model and definition
   - Phase 2: Create/test content in Universal Editor
   - Phase 3: Implement JavaScript decoration and CSS styling

2. **Performance-First**: Buildless approach with minimal critical path CSS, deferred JavaScript loading

3. **Component Models**: Use semantic field names and leverage type inference (images, links, rich text)

4. **Accessibility**: Implement proper ARIA attributes, semantic HTML, and keyboard navigation

## Important Files

- `fstab.yaml` - Connects to AEM Cloud Service content source
- `component-*.json` - Generated Universal Editor configurations (don't edit directly)
- `.cursor/rules/` - Development guidelines and patterns for AI assistance