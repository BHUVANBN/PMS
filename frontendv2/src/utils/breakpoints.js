// Desktop-first breakpoint and layout utilities
// Breakpoints: xl: 1920px, lg: 1440px, md: 1366px, sm: 1024px

export const BREAKPOINTS = {
  xl: 1920,
  lg: 1440,
  md: 1366,
  sm: 1024,
};

export const COLUMN_WIDTHS = {
  xl: { left: 264, right: 380, gap: 24, padding: 32 },
  lg: { left: 244, right: 360, gap: 24, padding: 28 },
  md: { left: 224, right: 320, gap: 20, padding: 24 },
  sm: { left: 204, right: 300, gap: 20, padding: 20 },
};

export function getViewportTier(width) {
  const w = width || (typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.xl);
  if (w >= BREAKPOINTS.xl) return 'xl';
  if (w >= BREAKPOINTS.lg) return 'lg';
  if (w >= BREAKPOINTS.md) return 'md';
  return 'sm';
}

export function getLayoutMetrics(width) {
  const tier = getViewportTier(width);
  const metrics = COLUMN_WIDTHS[tier] || COLUMN_WIDTHS.md;
  return { tier, ...metrics };
}

export function getSidebarWidths(width) {
  const { left, right } = getLayoutMetrics(width);
  return { left, right };
}

export function desktopSpacing(width) {
  const { gap, padding } = getLayoutMetrics(width);
  return { gap, padding };
}
