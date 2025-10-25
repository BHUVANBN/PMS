# Typography System Documentation

## Overview
This document defines the standardized typography system for the Project Management System. All components should follow these standards for consistent, accessible, and professional text presentation.

## Heading Hierarchy

### H1 - Page Titles
- **Size**: 2rem (32px) on desktop, 1.75rem (28px) on mobile
- **Weight**: 700 (bold)
- **Margin Bottom**: 1.5rem
- **Line Height**: 1.2
- **Usage**: Main page titles (e.g., "Admin Dashboard", "HR Dashboard")
- **Class**: `.page-title` or `.heading-h1`
- **MUI Variant**: `h1`

### H2 - Section Titles
- **Size**: 1.5rem (24px) on desktop, 1.375rem (22px) on mobile
- **Weight**: 600 (semibold)
- **Margin Bottom**: 1rem
- **Line Height**: 1.3
- **Usage**: Major section headings (e.g., "User Management", "Recent Employees")
- **Class**: `.section-title` or `.heading-h2`
- **MUI Variant**: `h2`

### H3 - Card Titles
- **Size**: 1.25rem (20px) on desktop, 1.125rem (18px) on mobile
- **Weight**: 600 (semibold)
- **Margin Bottom**: 0.75rem
- **Line Height**: 1.4
- **Usage**: Card and widget titles
- **Class**: `.card-title` or `.heading-h3`
- **MUI Variant**: `h3`

### H4 - Sub-headings
- **Size**: 1.125rem (18px)
- **Weight**: 600 (semibold)
- **Margin Bottom**: 0.5rem
- **Line Height**: 1.4
- **Usage**: Sub-sections within cards or smaller groupings
- **Class**: `.sub-heading` or `.heading-h4`
- **MUI Variant**: `h4`

## Body Text Standards

### Primary Text
- **Size**: 1rem (16px)
- **Weight**: 400 (regular)
- **Line Height**: 1.6
- **Color**: `var(--text-default)` (#212121)
- **Usage**: Main body content, primary descriptions
- **Class**: `.text-primary` or `.body-text`
- **MUI Variant**: `body1`

### Secondary Text
- **Size**: 0.875rem (14px)
- **Weight**: 400 (regular)
- **Line Height**: 1.5
- **Color**: `var(--text-muted)` (#757575)
- **Usage**: Supporting information, captions, helper text
- **Class**: `.text-secondary` or `.supporting-text`
- **MUI Variant**: `body2`

### Small Text (Metadata)
- **Size**: 0.75rem (12px)
- **Weight**: 400 (regular)
- **Line Height**: 1.4
- **Color**: `var(--text-muted)` (#9e9e9e)
- **Usage**: Timestamps, metadata, fine print
- **Class**: `.text-small` or `.metadata-text`
- **MUI Variant**: `caption`

### Button Text
- **Size**: 0.875rem (14px)
- **Weight**: 500 (medium)
- **Line Height**: 1.5
- **Usage**: All button labels
- **Class**: `.button-text`

## Text Colors (WCAG AA Compliant)

### Primary Text Color
- **Color**: #212121 (dark gray/black)
- **Contrast Ratio**: 16.1:1 on white
- **Usage**: Main content, headings
- **Class**: `.text-color-primary`

### Secondary Text Color
- **Color**: #757575 (medium gray)
- **Contrast Ratio**: 4.6:1 on white
- **Usage**: Supporting information
- **Class**: `.text-color-secondary`

### Muted Text Color
- **Color**: #9e9e9e (light gray)
- **Contrast Ratio**: 2.8:1 on white (use for non-essential text only)
- **Usage**: Metadata, timestamps
- **Class**: `.text-color-muted`

### Disabled Text Color
- **Color**: #bdbdbd
- **Usage**: Disabled states
- **Class**: `.text-color-disabled`

## Text Alignment

### Default Alignment
- **Body text and form labels**: Left-aligned
- **Tables**: Left-aligned (except numeric columns which are right-aligned)
- **Lists**: Left-aligned

### Center Alignment
- **Usage**: Empty states, modals, confirmation dialogs
- **Class**: `.text-center`

### Right Alignment
- **Usage**: Numeric data in tables, action buttons in headers
- **Class**: `.text-right`

## Font Weights

- **Regular**: 400 (`.font-regular`)
- **Medium**: 500 (`.font-medium`)
- **Semibold**: 600 (`.font-semibold`)
- **Bold**: 700 (`.font-bold`)

## Special Text Utilities

### Text Truncation
- **Single line**: `.text-truncate`
- **Two lines**: `.text-truncate-2`
- **Three lines**: `.text-truncate-3`

### Links
- **Color**: `var(--color-primary-600)` (#4f46e5)
- **Hover**: `var(--color-primary-700)` (#4338ca) with underline
- **Class**: `.link`

### Form Labels
- **Size**: 0.875rem (14px)
- **Weight**: 500 (medium)
- **Alignment**: Left
- **Class**: `.form-label`

### Helper Text
- **Size**: 0.75rem (12px)
- **Color**: `var(--text-muted)` (#757575)
- **Class**: `.helper-text`

### Error Text
- **Size**: 0.75rem (12px)
- **Color**: `var(--color-error-600)` (#dc2626)
- **Class**: `.error-text`

### Success Text
- **Size**: 0.75rem (12px)
- **Color**: `var(--color-success-600)` (#059669)
- **Class**: `.success-text`

## Implementation Examples

### React/MUI Component
```jsx
// Page Title
<Typography variant="h1" className="page-title" sx={{ fontSize: { xs: '1.75rem', md: '2rem' }, fontWeight: 700, mb: 1.5 }}>
  Dashboard Title
</Typography>

// Section Title
<Typography variant="h2" className="section-title" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 1 }}>
  Section Name
</Typography>

// Body Text
<Typography variant="body1" className="text-primary" sx={{ fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 }}>
  Main content goes here
</Typography>

// Secondary Text
<Typography variant="body2" className="text-secondary" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
  Supporting information
</Typography>
```

### Plain HTML/CSS
```html
<h1 class="page-title">Dashboard Title</h1>
<h2 class="section-title">Section Name</h2>
<p class="text-primary">Main content goes here</p>
<p class="text-secondary">Supporting information</p>
```

## Responsive Behavior

Typography scales down on mobile devices:
- H1: 32px → 28px
- H2: 24px → 22px
- H3: 20px → 18px
- Body text remains consistent across breakpoints

## Accessibility Guidelines

1. **Contrast Ratios**: Maintain minimum 4.5:1 for body text, 3:1 for large text (18px+)
2. **Font Sizes**: Never go below 12px for any user-facing text
3. **Line Height**: Maintain 1.5+ for body text for readability
4. **Alignment**: Left-align body text for better readability (avoid justified text)
5. **Color**: Never rely solely on color to convey information

## Migration Checklist

When updating existing components:
- [ ] Replace hardcoded font sizes with standard values
- [ ] Apply appropriate heading hierarchy (H1 → H2 → H3 → H4)
- [ ] Use semantic color classes (`.text-primary`, `.text-secondary`, `.text-color-muted`)
- [ ] Ensure proper text alignment (left for body, center only for special cases)
- [ ] Add responsive font sizing for headings
- [ ] Verify WCAG AA contrast ratios
- [ ] Test on mobile devices for readability

## Files Modified

- `src/styles/typography.css` - Typography system definitions
- `src/index.css` - Global import of typography styles
- `src/pages/admin/AdminDashboard.jsx` - Applied standardized typography
- `src/pages/hr/HRDashboard.jsx` - Applied standardized typography
- `src/pages/manager/ManagerDashboard.jsx` - Applied standardized typography
- `src/pages/developer/DeveloperDashboard.jsx` - Applied standardized typography
- `src/pages/tester/TesterDashboard.jsx` - Applied standardized typography
