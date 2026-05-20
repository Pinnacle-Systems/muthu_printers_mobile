
export const getVariantStyles = (c) => ({
  primary:   { bg: c.primary,   labelColor: c.background, borderColor: 'transparent', borderWidth: 0 },
  secondary: { bg: c.secondary, labelColor: c.background, borderColor: 'transparent', borderWidth: 0 },
  outline:   { bg: 'transparent', labelColor: c.primary,  borderColor: c.primary,     borderWidth: 1.5 },
  ghost:     { bg: 'transparent', labelColor: c.text,     borderColor: 'transparent', borderWidth: 0 },
});

export const getSizeStyles = ({ spacing, typography }) => ({
  sm: { height: 38, paddingHorizontal: spacing.md, fontSize: typography.sm.fontSize },
  md: { height: 50, paddingHorizontal: spacing.lg, fontSize: typography.body.fontSize },
  lg: { height: 56, paddingHorizontal: spacing.xl, fontSize: typography.h3.fontSize },
});

export const getSpinnerColor = (variant, c) =>
  variant === 'outline' || variant === 'ghost' ? c.primary : c.background;