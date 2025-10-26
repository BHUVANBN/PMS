# Design System: Tokens and Usage

This document defines the design tokens for the Project Management System (frontendv2) and shows how to use them across the codebase.

- Location: `src/styles/tokens.css`
- Global import: `src/index.css` imports the tokens so variables are available everywhere.

## Principles
- **Modern, clean aesthetic** with high legibility.
- **WCAG AA contrast** default palette.
- **Consistent spacing** on an 8px base grid.
- **Clear type hierarchy** with scalable sizes.

## Color Palette (CSS Custom Properties)
Key groups are Primary, Secondary, Accent, Neutral, Success, Warning, Error, Info, each with `50-900` steps for flexibility.

Examples:
- Primary: `--color-primary-500` (`#6366f1`) is the main brand color.
- Neutral: ranges from `--color-neutral-0` (white) to `--color-neutral-1000` (near-black).

Semantic aliases:
- Backgrounds: `--bg-default`, `--bg-elevated`, `--bg-inverse`
- Text: `--text-default`, `--text-muted`, `--text-inverse`, `--text-on-primary`
- Borders and focus: `--border-default`, `--focus-ring`

## Typography
- Families:
  - `--font-sans`: Roboto/Inter stack
  - `--font-mono`: System mono
- Sizes:
  - `--font-size-xs` (12px)
  - `--font-size-sm` (14px)
  - `--font-size-md` (16px)
  - `--font-size-lg` (18px)
  - `--font-size-xl` (20px)
  - `--font-size-2xl` (24px)
  - `--font-size-3xl` (30px)
  - `--font-size-4xl` (36px)
- Weights:
  - `--font-weight-regular` (400)
  - `--font-weight-medium` (500)
  - `--font-weight-semibold` (600)
  - `--font-weight-bold` (700)
- Line heights:
  - `--line-height-tight` (1.2)
  - `--line-height-snug` (1.35)
  - `--line-height-normal` (1.5)
  - `--line-height-relaxed` (1.65)

## Spacing Scale (8px grid)
Use variables for consistent rhythm. Values in rem to respect user scaling.
- `--space-0`: 0
- `--space-0_5`: 0.5rem (8px)
- `--space-1`: 1rem (16px)
- `--space-1_5`: 1.5rem (24px)
- `--space-2`: 2rem (32px)
- `--space-3`: 3rem (48px)
- `--space-4`: 4rem (64px)
- `--space-6`: 6rem (96px)
- `--space-8`: 8rem (128px)
- `--space-12`: 12rem (192px)
- `--space-16`: 16rem (256px)
- `--space-20`: 20rem (320px)
- `--space-24`: 24rem (384px)

## Radius
- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-xl`: 16px
- `--radius-2xl`: 24px
- `--radius-full`: 9999px

## Shadows (Elevations)
- `--shadow-sm` – subtle
- `--shadow-md` – standard card
- `--shadow-lg` – raised surfaces
- `--shadow-xl` – modal/popover

## Z-Index Scale
- `--z-base`: 0
- `--z-dropdown`: 1000
- `--z-sticky`: 1100
- `--z-fixed`: 1200
- `--z-drawer`: 1250
- `--z-modal`: 1300
- `--z-popover`: 1400
- `--z-tooltip`: 1500
- `--z-toast`: 1600
- `--z-max`: 2147483647

## Theming
A dark theme scaffold is provided via `[data-theme="dark"]` overrides in `tokens.css`. You can set it on `html` or the app root to enable dark colors.

## Usage

### Plain CSS
```css
.button-primary {
  background: var(--color-primary-500);
  color: var(--text-on-primary);
  padding: var(--space-0_5) var(--space-1);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### Tailwind (optional via arbitrary values)
You can reference CSS variables with arbitrary values if needed:
```html
<div class="bg-[var(--bg-elevated)] text-[var(--text-default)] shadow-[var(--shadow-md)]"></div>
```
If deeper Tailwind integration is desired later, we can map CSS variables in `tailwind.config.js` theme extensions without altering component structure now.

### MUI (Material UI) Theming
For components using MUI, keep using the MUI theme. When we align MUI theme with these tokens, we can create a theme object that reads from the CSS variables (e.g., via `getComputedStyle(document.documentElement)` at runtime) or by duplicating values in the theme. No changes are made now.

## Non-invasive Defaults
`tokens.css` provides minimal base hooks for `html, body` and a utility class `.card-elevated` to demonstrate usage. It does not modify existing component structure or functionality.

## Accessibility
- Primary and semantic colors are chosen to meet WCAG AA contrast where used on appropriate backgrounds.
- Prefer `--text-default` on `--bg-default`, and `--text-on-primary` on `--color-primary-500` backgrounds.

## Future Enhancements
- Map tokens to Tailwind theme for first-class class names.
- Create a MUI theme synchronized with tokens.
- Add component-level tokenized patterns (buttons, inputs, etc.).
