# Profiles Container Block

A container block for displaying multiple profile items in a grid layout, based on the Figma design with horizontal profile layout featuring circular profile images and author information.

## Features

- **Container Layout**: Displays multiple profile items in a responsive grid
- **Profile Items**: Each profile includes image, name, title, and bio
- **Horizontal Layout**: Profile image and content are displayed side by side
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Full keyboard navigation and screen reader support
- **Analytics**: Built-in tracking for profile interactions

## Usage

### In Universal Editor

1. Add a "Profiles Container" block to your page
2. Add "Profile Item" blocks inside the container
3. Configure each profile item with:
   - Profile Image
   - Author Name
   - Author Title/Position
   - Author Bio

### Block Options

The profiles container supports the following layout variants:

- **Default**: Standard horizontal layout
- **Compact**: Smaller profile images and reduced padding
- **Vertical**: Stacked layout with centered content

## Structure

```
profiles-container/
├── _profiles-container.json    # Block definition and model
├── profiles-container.css      # Styling
├── profiles-container.js       # JavaScript functionality
├── index.js                    # Entry point
└── README.md                   # Documentation
```

## CSS Classes

### Container Classes
- `.profiles-container` - Main container wrapper
- `.profiles-container-list` - Unordered list for profile items

### Profile Item Classes
- `.profiles-container-profile-item` - Individual profile item
- `.profiles-container-profile-image` - Profile image wrapper
- `.profiles-container-profile-content` - Profile content area
- `.profiles-container-author-name` - Author name styling
- `.profiles-container-author-title` - Author title/position
- `.profiles-container-author-bio` - Author bio text

## Responsive Behavior

- **Mobile (≤768px)**: Single column layout with smaller profile images
- **Tablet/Desktop (>768px)**: Multi-column grid layout with full-size images

## Accessibility Features

- ARIA labels for profile images
- Keyboard navigation for profile links
- Screen reader friendly structure
- High contrast mode support
- Reduced motion support

## Analytics Events

The block tracks the following events:

- `profile_interaction`: When a profile link is clicked
  - `block_type`: "profiles-container"
  - `action`: "profile_click"
  - `profile_index`: Index of the clicked profile
  - `profile_name`: Name of the clicked profile

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- AEM.js utilities for image optimization
- Scripts.js for instrumentation
- CSS custom properties for theming
