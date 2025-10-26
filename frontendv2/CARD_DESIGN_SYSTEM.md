# Card Design System Documentation

## Overview
This document defines the standardized card component design system for the Project Management System. All cards across the application follow consistent styling for containers, headers, bodies, and footers.

## Card Design Principles

### 1. Visual Consistency
- All cards use the same border-radius (12px)
- Consistent padding (1.5rem desktop, 1rem mobile)
- Unified shadow system for elevation
- Smooth hover transitions (0.2s ease)

### 2. Accessibility
- Proper contrast ratios (WCAG AA compliant)
- Clear focus states for interactive cards
- Keyboard navigation support
- Touch-friendly targets (48px minimum)

### 3. Responsive Design
- Mobile-first approach
- Adaptive padding and spacing
- Flexible grid layouts
- Touch-optimized interactions

## Card Container Styling

### Base Card
```css
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}
```

**Usage**:
```jsx
<div className="card">
  {/* Card content */}
</div>
```

### Card Variants

#### Borderless Card
No border, shadow only
```css
.card-borderless {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

#### Glass Card
Glassmorphism effect with backdrop blur
```css
.card-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
```

### Hover States
```css
.card-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

**Usage**:
```jsx
<div className="card card-hover">
  {/* Hoverable card */}
</div>
```

### Interactive States

#### Clickable
```css
.card-clickable {
  cursor: pointer;
  user-select: none;
}
```

#### Selected
```css
.card-selected {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

#### Disabled
```css
.card-disabled {
  opacity: 0.6;
  pointer-events: none;
}
```

## Card Structure

### Card Header
```css
.card-header {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header-title {
  font-size: 1.25rem;  /* H3 style */
  font-weight: 600;
  line-height: 1.4;
}

.card-header-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}
```

**Usage**:
```jsx
<div className="card">
  <div className="card-header">
    <h3 className="card-header-title">Card Title</h3>
    <div className="card-header-actions">
      <button>Action</button>
    </div>
  </div>
</div>
```

### Card Header with Divider
```jsx
<div className="card">
  <div className="card-header">
    <h3 className="card-header-title">Card Title</h3>
  </div>
  <hr className="card-header-divider" />
  <div className="card-body">
    {/* Content */}
  </div>
</div>
```

### Card Body
```css
.card-body {
  line-height: 1.6;
}

.card-body > * + * {
  margin-top: 0.75rem;  /* Spacing between elements */
}
```

### Card Body List
```css
.card-body-list-item {
  padding: 0.75rem;
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.card-body-list-item:hover {
  background-color: #f9fafb;
}
```

**Usage**:
```jsx
<div className="card">
  <ul className="card-body-list">
    <li className="card-body-list-item">Item 1</li>
    <li className="card-body-list-item">Item 2</li>
  </ul>
</div>
```

### Card Footer
```css
.card-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

**Usage**:
```jsx
<div className="card">
  <div className="card-body">
    {/* Content */}
  </div>
  <div className="card-footer">
    <span>Metadata</span>
    <div className="card-footer-actions">
      <button>Action</button>
    </div>
  </div>
</div>
```

## Dashboard Card Variants

### Stat Card
Perfect for displaying key metrics and statistics.

**Features**:
- Large number display (2rem/700)
- Icon with colored background
- Label text (0.875rem/400)
- Optional trend indicator
- Accent color variants

**Structure**:
```jsx
<div className="card-stat card-stat-primary">
  <div className="card-stat-icon">
    <Icon />
  </div>
  <div className="card-stat-number">1,234</div>
  <div className="card-stat-label">Total Users</div>
  <div className="card-stat-trend">
    ↑ 12% from last month
  </div>
</div>
```

**Color Variants**:
- `.card-stat-primary` - Primary blue accent
- `.card-stat-success` - Green accent
- `.card-stat-warning` - Orange accent
- `.card-stat-error` - Red accent
- `.card-stat-info` - Light blue accent

### Task Card
For displaying tasks, tickets, or action items.

**Features**:
- Status indicator (colored dot)
- Title and description
- Assigned user avatar
- Due date display
- Hover effect

**Structure**:
```jsx
<div className="card-task">
  <div className="card-task-header">
    <div className="card-task-status card-task-status-progress"></div>
    <h4 className="card-task-title">Task Title</h4>
  </div>
  <p className="card-task-description">Task description goes here...</p>
  <div className="card-task-meta">
    <div className="card-task-assignee">
      <Avatar />
      <span>John Doe</span>
    </div>
    <div className="card-task-due-date">
      📅 Dec 25, 2024
    </div>
  </div>
</div>
```

**Status Colors**:
- `.card-task-status-todo` - Gray
- `.card-task-status-progress` - Blue
- `.card-task-status-review` - Orange
- `.card-task-status-done` - Green

### Project Card
For displaying project information with progress.

**Features**:
- Project icon/thumbnail
- Title and description
- Progress bar
- Team member avatars
- Metadata footer

**Structure**:
```jsx
<div className="card-project">
  <div className="card-project-header">
    <div className="card-project-icon">P</div>
    <div>
      <h4 className="card-project-title">Project Name</h4>
      <p className="card-project-description">Project description...</p>
    </div>
  </div>
  
  <div className="card-project-progress">
    <div className="card-project-progress-label">
      <span>Progress</span>
      <span>75%</span>
    </div>
    <div className="card-project-progress-bar">
      <div className="card-project-progress-fill" style={{ width: '75%' }}></div>
    </div>
  </div>
  
  <div className="card-project-footer">
    <div className="card-project-team">
      <div className="card-project-team-avatars">
        <div className="card-project-team-avatar">JD</div>
        <div className="card-project-team-avatar">AB</div>
      </div>
    </div>
    <span>Due: Dec 31</span>
  </div>
</div>
```

## React Component Usage

### Using the Card Component

```jsx
import Card from '@/components/ui/Card';

// Basic Card
<Card>
  <Card.Header>
    <h3>Title</h3>
  </Card.Header>
  <Card.Body>
    Content goes here
  </Card.Body>
  <Card.Footer>
    Footer content
  </Card.Footer>
</Card>

// Stat Card
<Card variant="stat" hover>
  <div className="card-stat-icon">📊</div>
  <div className="card-stat-number">1,234</div>
  <div className="card-stat-label">Total Users</div>
</Card>

// Task Card
<Card variant="task" clickable hover onClick={handleClick}>
  {/* Task content */}
</Card>

// Project Card
<Card variant="project" hover>
  {/* Project content */}
</Card>

// Glass Card
<Card glass>
  {/* Content with glassmorphism effect */}
</Card>

// Borderless Card
<Card borderless>
  {/* Content without border */}
</Card>
```

### Card Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'stat' \| 'task' \| 'project'` | `'default'` | Card style variant |
| `hover` | `boolean` | `false` | Enable hover lift effect |
| `clickable` | `boolean` | `false` | Make card clickable |
| `selected` | `boolean` | `false` | Show selected state |
| `disabled` | `boolean` | `false` | Disable interactions |
| `borderless` | `boolean` | `false` | Remove border |
| `glass` | `boolean` | `false` | Apply glassmorphism effect |

## Responsive Grid Layouts

### Card Grid
```jsx
<div className="card-grid">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>
```

**Breakpoints**:
- Mobile (< 640px): 1 column
- Tablet (640px+): 2 columns
- Desktop (1024px+): 2 columns (use `.card-grid-3` or `.card-grid-4` for more)

### 3-Column Grid
```jsx
<div className="card-grid card-grid-3">
  {/* Cards */}
</div>
```

### 4-Column Grid
```jsx
<div className="card-grid card-grid-4">
  {/* Cards */}
</div>
```

## MUI Integration

### Converting MUI Paper to Card

**Before**:
```jsx
<Paper elevation={0} sx={{ p: 3, borderRadius: '12px' }}>
  Content
</Paper>
```

**After**:
```jsx
<div className="card">
  Content
</div>
```

### With MUI Components Inside
```jsx
<div className="card">
  <div className="card-header">
    <Typography variant="h3" className="card-header-title">
      Title
    </Typography>
    <div className="card-header-actions">
      <Button variant="outlined">Action</Button>
    </div>
  </div>
  <div className="card-body">
    <Typography variant="body1">Content</Typography>
  </div>
</div>
```

## Utility Classes

### Spacing
- `.card-compact` - Padding: 1rem
- `.card-comfortable` - Padding: 1.5rem (default)
- `.card-spacious` - Padding: 2rem

### States
- `.card-loading` - Show loading overlay
- `.card-selected` - Highlight as selected
- `.card-disabled` - Disable interactions

## Best Practices

### 1. Consistent Padding
Always use the standard padding (1.5rem desktop, 1rem mobile) unless there's a specific design reason.

### 2. Proper Hierarchy
- Use H3 for card titles
- Use body text for descriptions
- Use small text for metadata

### 3. Hover States
Add hover effects to clickable cards for better UX:
```jsx
<Card hover clickable onClick={handleClick}>
  {/* Content */}
</Card>
```

### 4. Accessibility
- Add `role="button"` to clickable cards
- Include keyboard navigation
- Ensure proper contrast ratios
- Use semantic HTML inside cards

### 5. Performance
- Avoid excessive nesting
- Use CSS transitions instead of JavaScript animations
- Lazy load card content when appropriate

## Migration Checklist

When updating existing cards:

- [ ] Replace `<Paper>` with `<div className="card">`
- [ ] Update padding from `sx={{ p: 3 }}` to default card padding
- [ ] Apply `.card-header` to header sections
- [ ] Use `.card-header-title` for titles (H3 style)
- [ ] Add `.card-body` to main content
- [ ] Apply `.card-footer` if footer exists
- [ ] Add `hover` prop for interactive cards
- [ ] Use appropriate variant (`stat`, `task`, `project`)
- [ ] Test responsive behavior on mobile
- [ ] Verify accessibility (keyboard navigation, contrast)

## Examples

### Dashboard Stat Cards
```jsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    <div className="card-stat card-stat-primary">
      <div className="card-stat-icon">👥</div>
      <div className="card-stat-number">1,234</div>
      <div className="card-stat-label">Total Users</div>
      <div className="card-stat-trend">↑ 12%</div>
    </div>
  </Grid>
  {/* More stat cards */}
</Grid>
```

### Task List
```jsx
<div className="card">
  <div className="card-header">
    <h3 className="card-header-title">My Tasks</h3>
    <div className="card-header-actions">
      <Button size="small">View All</Button>
    </div>
  </div>
  <ul className="card-body-list">
    {tasks.map(task => (
      <li key={task.id} className="card-body-list-item">
        <div className="card-task">
          {/* Task content */}
        </div>
      </li>
    ))}
  </ul>
</div>
```

### Project Grid
```jsx
<div className="card-grid card-grid-3">
  {projects.map(project => (
    <div key={project.id} className="card-project">
      {/* Project content */}
    </div>
  ))}
</div>
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ iOS Safari (latest)
- ✅ Android Chrome (latest)

## Related Documentation

- [TYPOGRAPHY_SYSTEM.md](./TYPOGRAPHY_SYSTEM.md) - Typography specifications
- [FORM_TYPOGRAPHY_GUIDE.md](./FORM_TYPOGRAPHY_GUIDE.md) - Form styling guide
- [src/styles/cards.css](./src/styles/cards.css) - Card CSS source

---

**Last Updated**: October 25, 2025  
**Status**: ✅ Complete - Card design system ready for implementation
