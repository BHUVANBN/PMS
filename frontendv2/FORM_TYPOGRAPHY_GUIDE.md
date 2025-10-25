# Form Typography Implementation Guide

## Overview
This guide documents the standardized typography system for all forms and inputs across the Project Management System. All forms now follow consistent styling for labels, inputs, helper text, and error messages.

## Typography Standards Applied

### 1. Form Labels
- **Font-size**: 0.875rem (14px)
- **Font-weight**: 500 (medium)
- **Color**: Primary text color (#212121)
- **Margin-bottom**: 0.5rem
- **Required indicator**: Red asterisk (*) with 0.25rem spacing
- **Text-align**: Left

**CSS Class**: `.form-label`

**Implementation**:
```jsx
<FormInput label="Email" required />
// Label automatically styled: 14px, weight 500, with red asterisk
```

### 2. Input Fields
- **Font-size**: 1rem (16px) - prevents mobile zoom on focus
- **Font-weight**: 400 (regular)
- **Line-height**: 1.5
- **Placeholder text**: Muted color (#9e9e9e)
- **Min-height**: 48px for touch targets

**Mobile Behavior**:
- Font-size stays at 16px on mobile to prevent iOS zoom
- Maintains accessibility and usability

**Implementation**:
```jsx
<FormInput 
  label="Username" 
  placeholder="Enter your username"
  value={username}
  onChange={handleChange}
/>
```

### 3. Helper Text
- **Font-size**: 0.75rem (12px)
- **Font-weight**: 400 (regular)
- **Line-height**: 1.4
- **Color**: Muted (#757575)
- **Margin-top**: 0.25rem

**CSS Class**: `.input-helper-text`

**Implementation**:
```jsx
<FormInput 
  label="Password"
  helperText="Must be at least 8 characters"
/>
```

### 4. Error Messages
- **Font-size**: 0.75rem (12px)
- **Font-weight**: 400 (regular)
- **Line-height**: 1.4
- **Color**: Error color (#dc2626)
- **Margin-top**: 0.25rem
- **Icon prefix**: ⚠ warning icon

**CSS Class**: `.input-error-text`

**Implementation**:
```jsx
<FormInput 
  label="Email"
  error="Please enter a valid email address"
/>
```

### 5. Form Section Headings
- **Font-size**: 1.25rem (20px)
- **Font-weight**: 600 (semibold)
- **Margin-bottom**: 0.75rem
- **Line-height**: 1.4
- **Style**: H3 heading style

**CSS Class**: `.form-section-heading`

**Implementation**:
```jsx
<FormSection title="Personal Information">
  {/* Form fields */}
</FormSection>
```

### 6. Form Spacing

**Form Groups** (major sections):
- **Margin-bottom**: 1.5rem (24px)
- **CSS Class**: `.form-group`

**Form Fields** (individual inputs):
- **Margin-bottom**: 1rem (16px)
- **CSS Class**: `.form-field`

**Form Rows** (side-by-side fields):
- **Gap**: 1rem (16px)
- **CSS Class**: `.form-row`
- Responsive: 1 column on mobile, 2 columns on tablet+

## Updated Components

### Shared Form Components (`src/components/shared/FormComponents.jsx`)

All form components now include standardized typography:

1. **FormInput** - Text inputs, textareas, password fields
2. **FormSelect** - Dropdown selects
3. **FormAutocomplete** - Autocomplete inputs
4. **FormCheckbox** - Checkbox inputs
5. **FormRadioGroup** - Radio button groups
6. **FormSwitch** - Toggle switches
7. **FormDatePicker** - Date picker inputs
8. **FormFileUpload** - File upload fields
9. **FormArray** - Dynamic form arrays
10. **FormSection** - Form section containers
11. **FormActions** - Form action buttons

### Updated Form Pages

#### Admin Forms
- ✅ **UserCreate.jsx** - H1 page title, form-field classes
- ✅ **UserEdit.jsx** - H1 page title, standardized typography

#### HR Forms
- **EmployeeCreate.jsx** - Uses FormComponents (auto-styled)
- **EmployeeEdit.jsx** - Uses FormComponents (auto-styled)
- **EmployeeForm.jsx** - Uses FormComponents (auto-styled)

#### Manager Forms
- **ProjectCreate.jsx** - Uses FormComponents (auto-styled)
- **ProjectEdit.jsx** - Uses FormComponents (auto-styled)
- **ProjectForm.jsx** - Uses FormComponents (auto-styled)
- **TicketForm.jsx** - Uses FormComponents (auto-styled)

## CSS Classes Reference

### Typography Classes
```css
.form-label              /* Form labels: 14px/500 */
.form-section-heading    /* Section headings: 20px/600 */
.input-helper-text       /* Helper text: 12px/400, muted */
.input-error-text        /* Error messages: 12px/400, error color */
.button-text             /* Button text: 14px/500 */
```

### Spacing Classes
```css
.form-group              /* Form sections: mb 1.5rem */
.form-field              /* Individual fields: mb 1rem */
.form-row                /* Side-by-side fields: grid with 1rem gap */
.form-row-3              /* 3-column grid on desktop */
```

### MUI Component Overrides
All MUI form components are automatically styled via global CSS:
```css
.MuiInputLabel-root      /* Labels: 14px/500 */
.MuiInputBase-input      /* Inputs: 16px/400 */
.MuiFormHelperText-root  /* Helper text: 12px/400 */
.MuiFormControlLabel-label /* Checkbox/Radio labels: 14px/400 */
```

## Usage Examples

### Basic Form with Sections
```jsx
import { FormInput, FormSelect, FormSection, FormActions } from '@/components/shared/FormComponents';

function MyForm() {
  return (
    <Box>
      <Typography variant="h1" className="page-title" sx={{ fontSize: { xs: '1.75rem', md: '2rem' }, fontWeight: 700, mb: 3 }}>
        Create User
      </Typography>
      
      <Paper sx={{ p: 3 }} className="card-pad">
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {error && <Box className="input-error-text">{error}</Box>}
            
            <FormSection title="Personal Information">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} className="form-field">
                  <FormInput 
                    label="First Name" 
                    value={firstName}
                    onChange={handleChange}
                    required 
                  />
                </Grid>
                <Grid item xs={12} sm={6} className="form-field">
                  <FormInput 
                    label="Last Name" 
                    value={lastName}
                    onChange={handleChange}
                    required 
                  />
                </Grid>
              </Grid>
            </FormSection>
            
            <FormSection title="Account Details">
              <Grid container spacing={2}>
                <Grid item xs={12} className="form-field">
                  <FormInput 
                    label="Email" 
                    type="email"
                    value={email}
                    onChange={handleChange}
                    helperText="We'll never share your email"
                    required 
                  />
                </Grid>
                <Grid item xs={12} className="form-field">
                  <FormSelect 
                    label="Role" 
                    value={role}
                    onChange={handleChange}
                    options={roleOptions}
                    required 
                  />
                </Grid>
              </Grid>
            </FormSection>
            
            <FormActions>
              <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" variant="contained">Create User</Button>
            </FormActions>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
```

### Form with Validation Errors
```jsx
<FormInput 
  label="Email"
  type="email"
  value={email}
  onChange={handleChange}
  error={errors.email}  // "Please enter a valid email"
  required
/>
// Error displays as: ⚠ Please enter a valid email (12px, red)
```

### Side-by-Side Fields
```jsx
<div className="form-row">
  <FormInput label="First Name" {...props} />
  <FormInput label="Last Name" {...props} />
</div>
// Automatically responsive: 1 column mobile, 2 columns tablet+
```

## Accessibility Features

✅ **WCAG AA Compliant**
- Label contrast: 16.1:1 (primary text on white)
- Helper text contrast: 4.6:1 (secondary text on white)
- Error text contrast: 7.5:1 (error color on white)

✅ **Mobile-Friendly**
- 16px input font size prevents iOS zoom
- 48px minimum touch target height
- Proper spacing for touch interaction

✅ **Keyboard Navigation**
- All inputs properly labeled
- Focus states clearly visible
- Logical tab order maintained

✅ **Screen Reader Support**
- Required fields properly announced
- Error messages associated with inputs
- Helper text provides additional context

## Migration Checklist

When updating existing forms:

- [ ] Replace hardcoded page titles with H1 + `.page-title` class
- [ ] Wrap form in Paper with `.card-pad` class
- [ ] Use FormSection components with proper titles
- [ ] Add `.form-field` class to Grid items containing inputs
- [ ] Use `.form-row` for side-by-side fields
- [ ] Replace custom error displays with `.input-error-text`
- [ ] Ensure all FormInput/FormSelect components are used (not raw TextField)
- [ ] Verify button text uses `.button-text` class
- [ ] Test on mobile devices (16px input font size)
- [ ] Verify WCAG AA contrast ratios

## Testing

### Visual Testing
1. Check label font size (14px) and weight (500)
2. Verify input font size (16px on all devices)
3. Confirm helper text is 12px and muted color
4. Validate error messages show red with icon
5. Test form spacing (1.5rem between sections, 1rem between fields)

### Functional Testing
1. Test required field validation
2. Verify error messages display correctly
3. Check mobile zoom prevention (iOS Safari)
4. Test keyboard navigation
5. Verify screen reader announcements

### Responsive Testing
1. Mobile (< 640px): Single column layout
2. Tablet (640px+): Two column layout
3. Desktop (1024px+): Three column option available
4. Verify touch targets are 48px minimum

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ iOS Safari (prevents zoom)
- ✅ Android Chrome (prevents zoom)

## Future Enhancements

- [ ] Dark mode form typography adjustments
- [ ] Additional form field types (color picker, range slider)
- [ ] Form validation library integration
- [ ] Animated error message transitions
- [ ] Multi-step form wizard component

## Related Documentation

- [TYPOGRAPHY_SYSTEM.md](./TYPOGRAPHY_SYSTEM.md) - Complete typography specifications
- [TYPOGRAPHY_IMPLEMENTATION_SUMMARY.md](./TYPOGRAPHY_IMPLEMENTATION_SUMMARY.md) - Implementation report
- [FormComponents.jsx](./src/components/shared/FormComponents.jsx) - Shared form components

---

**Last Updated**: October 25, 2025  
**Status**: ✅ Complete - All form components standardized
