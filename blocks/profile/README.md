# Profile Component

A profile component that displays author information with a circular profile image and name. Perfect for showcasing article authors, team members, or content creators.

## Features

- **Responsive Design**: Mobile-first approach with optimized layouts for all screen sizes
- **Multiple Variants**: Default (horizontal), vertical, and compact layout options
- **Accessible**: Full keyboard navigation, screen reader support, and high contrast mode
- **Universal Editor Compatible**: Works seamlessly with AEM Universal Editor
- **Optimized Images**: Automatic image optimization with multiple breakpoints
- **Figma Design Match**: Follows exact specifications from Figma design

## Usage

To use the Profile component, create a table in your document with "Profile" in the first cell:

`| Profile |`
`|---|`
`| ![Profile Image](./path/to/profile.jpg) |`
`| Max Schreiber |`

### Layout Variants

#### Default (Horizontal)
`| Profile |`

#### Vertical Layout
`| Profile (vertical) |`

#### Compact Layout
`| Profile (compact) |`

## Authoring

### Structure

The profile component supports flexible content structure:

1. **Profile Image**: Any image element (automatically optimized and made circular)
2. **Author Name**: Text content for the author's name

### Content Guidelines

- **Profile Image**: Use high-quality square images for best circular crop results
- **Author Name**: Keep names concise and professional
- **Author Prefix**: Defaults to "Autor: " but can be customized

### Layout Variants

#### Default (Horizontal)
- Image on the left (60px circular)
- Author name on the right
- Best for: Article bylines, author credits

#### Vertical
- Image on top (80px circular)
- Author name below, centered
- Best for: Team member cards, speaker profiles

#### Compact
- Smaller image (40px circular)
- Smaller text
- Best for: Comments, small author credits

## Styling

The component uses CSS custom properties and follows the design system:

- **Profile Image**: 60px circular (default), 80px (vertical), 40px (compact)
- **Author Prefix**: Gray color (#4f4f4f), 18px font size
- **Author Name**: Red color (#a91a2d), underlined, 18px font size
- **Font Family**: Open Sans Regular

## Responsive Behavior

- **Mobile**: Maintains horizontal layout with smaller image (50px)
- **Tablet**: Slightly larger image (55px) with adjusted spacing
- **Desktop**: Full Figma specifications (60px image)

## Accessibility

- Proper ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode support
- Focus indicators for interactive elements
- Semantic HTML structure

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
