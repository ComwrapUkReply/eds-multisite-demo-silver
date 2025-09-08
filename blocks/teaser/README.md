# Teaser Component

A flexible teaser component that displays an image, title, description, and optional call-to-action button. Perfect for showcasing content, products, services, or articles in a visually appealing card format.

## Features

- **Responsive Design**: Mobile-first approach with optimized layouts for all screen sizes
- **Multiple Variants**: Default (vertical), horizontal, and compact layout options
- **Accessible**: Full keyboard navigation, screen reader support, and high contrast mode
- **Interactive**: Hover effects and optional clickable card functionality
- **Universal Editor Compatible**: Works seamlessly with AEM Universal Editor
- **Optimized Images**: Automatic image optimization with multiple breakpoints

## Usage

To use the Teaser component, create a table in your document with "Teaser" in the first cell:

`| Teaser |`
`|---|`
`| ![Image](./path/to/image.jpg) |`
`| ## Your Title Here |`
`| Your description text goes here. |`
`| [Call to Action](https://example.com) |`

### Layout Variants

#### Default (Vertical)
`| Teaser |`

#### Horizontal Layout
`| Teaser (horizontal) |`

#### Compact Layout
`| Teaser (compact) |`

## Authoring

### Structure

The teaser component supports flexible content structure:

1. **Image**: Any image element (automatically optimized)
2. **Title**: Heading elements (H1, H2, H3, H4)
3. **Description**: Paragraph text
4. **Call-to-Action**: Link element (rendered as button)

### Content Guidelines

- **Image**: Use high-quality images with appropriate alt text for accessibility
- **Title**: Keep titles concise and descriptive (recommended: 2-6 words)
- **Description**: Provide clear, engaging descriptions (recommended: 1-2 sentences)
- **CTA**: Use action-oriented link text (e.g., "Learn More", "Get Started", "View Details")

### Layout Variants

#### Default (Vertical)
- Image at the top
- Content below in vertical stack
- Best for: General content cards, blog posts, articles

#### Horizontal
- Image on the left (40% width)
- Content on the right (60% width)
- Automatically switches to vertical on mobile
- Best for: Featured content, detailed descriptions

#### Compact
- Smaller image and reduced padding
- Condensed content layout
- Best for: Lists, grids, space-constrained areas

## Styling

The component uses CSS custom properties for theming:

- `--background-color`: Card background
- `--text-color`: Primary text color
- `--dark-color`: Secondary text color
- `--link-color`: Button background and accent color
- `--link-hover-color`: Button hover state
- `--heading-font-family`: Title font family
- `--body-font-size-*`: Text size variables

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with focus indicators
- **Screen Readers**: Proper semantic markup and ARIA attributes
- **High Contrast**: Enhanced visibility in high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Clear focus indicators and logical tab order

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11 with graceful degradation
- Mobile browsers (iOS Safari, Chrome Mobile)

## Examples

See `example.md` for various implementation examples and use cases.