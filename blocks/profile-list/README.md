# Profile List Block

A responsive grid container block that displays a collection of profile cards with images and information. Each profile item can contain detailed information about team members, staff, or any other individuals.

## Features

- **Responsive Grid Layout**: Automatically adjusts the number of columns based on screen size and number of profiles
- **Profile Cards**: Individual cards with image, name, title, department, bio, and contact information
- **Multiple Variants**: Card, Compact, and Detailed layouts
- **Style Options**: Default, Highlighted, and Minimal styles
- **Accessibility**: Full keyboard navigation and screen reader support
- **Mobile-First Design**: Optimized for all device sizes

## Usage

### 1. Add Profile List Block

1. In the Universal Editor, add a "Profile List" block to your page
2. The block will appear as a container ready for profile items

### 2. Add Profile Items

1. Add "Profile Item" blocks as children of the Profile List
2. Configure each profile item with the required information:
   - **Profile Image**: Upload a profile photo
   - **Image Alt Text**: Descriptive text for accessibility
   - **Full Name**: Person's complete name
   - **Job Title**: Professional title or position
   - **Department**: Organizational department
   - **Email**: Contact email address
   - **Phone**: Contact phone number
   - **Bio**: Brief description or biography
   - **Profile Options**: Layout and style variants

### 3. Configure Layout Options

Each profile item supports the following options:

#### Layout Variants
- **Card**: Default card style with border and shadow
- **Compact**: Smaller padding and image size for dense layouts
- **Detailed**: Larger image and more spacing for prominent profiles

#### Style Variants
- **Default**: Standard appearance with subtle styling
- **Highlighted**: Accent border and enhanced shadow for emphasis
- **Minimal**: No border, subtle shadow for clean appearance

## Responsive Behavior

The block automatically adjusts its grid layout based on screen size:

- **Mobile (≤767px)**: Single column layout
- **Tablet (768px-1023px)**: Up to 2 columns
- **Desktop (≥1024px)**: Up to 3 columns
- **Large Desktop (≥1400px)**: Auto-fit columns with minimum 280px width

## Accessibility Features

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML structure
- **Focus Management**: Clear focus indicators for navigation
- **High Contrast Support**: Enhanced visibility in high contrast mode
- **Reduced Motion**: Respects user preferences for reduced motion

## Technical Details

### File Structure
```
blocks/profile-list/
├── _profile-list.json    # Block definition and models
├── profile-list.js       # JavaScript implementation
├── profile-list.css      # Styling and responsive design
├── index.js             # Module exports
└── README.md            # Documentation
```

### CSS Classes

#### Container Classes
- `.profile-list-container`: Main container wrapper
- `.profile-list-wrapper`: Grid container
- `.profile-item`: Individual profile item container
- `.profile-card`: Profile card element

#### Layout Classes
- `.profile-list-single`: Single column layout
- `.profile-list-double`: Two column layout
- `.profile-list-triple`: Three column layout
- `.profile-list-multiple`: Auto-fit multiple columns

#### Variant Classes
- `.profile-card-card`: Default card style
- `.profile-card-compact`: Compact layout
- `.profile-card-detailed`: Detailed layout
- `.profile-card-highlighted`: Highlighted style
- `.profile-card-minimal`: Minimal style

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Optimized Images**: Automatic image optimization with responsive breakpoints
- **Lazy Loading**: Images load as they come into view
- **Efficient Rendering**: Minimal DOM manipulation for optimal performance
- **CSS Grid**: Modern layout system for better performance than flexbox alternatives

## Examples

### Basic Profile List
```html
<div class="block profile-list">
  <div class="profile-list-container">
    <div class="profile-list-wrapper profile-list-grid">
      <div class="profile-item">
        <div class="profile-card">
          <!-- Profile content -->
        </div>
      </div>
    </div>
  </div>
</div>
```

### Compact Profile List
```html
<div class="block profile-list">
  <div class="profile-list-container">
    <div class="profile-list-wrapper profile-list-grid">
      <div class="profile-item">
        <div class="profile-card profile-card-compact">
          <!-- Compact profile content -->
        </div>
      </div>
    </div>
  </div>
</div>
```

## Troubleshooting

### Common Issues

1. **Profiles not displaying**: Ensure profile items are added as children of the Profile List block
2. **Layout issues**: Check that the Profile List block is properly configured in the Universal Editor
3. **Images not loading**: Verify image references are correct and images are published
4. **Responsive issues**: Test on different screen sizes to ensure proper grid behavior

### Debug Mode

To enable debug logging, add `?debug=true` to the URL when testing in the Universal Editor.

## Related Components

- **Profile Block**: Single profile display
- **Cards Block**: General card container
- **Columns Block**: Multi-column layout container
