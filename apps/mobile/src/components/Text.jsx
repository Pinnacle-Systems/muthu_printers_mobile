import React from 'react';
import { Text, StyleSheet } from 'react-native';
import useThemeProvider from '../Theme/useThemeProvider';

/**
 * AppText — Theme-aware reusable Text component
 *
 * Props:
 *  variant     - 'h1'|'h2'|'h3'|'body'|'sm'|'xs'|'label'|'caption'
 *  color       - override text color (uses theme color key or raw hex)
 *  weight      - '300'|'400'|'500'|'600'|'700'|'800'
 *  align       - 'left'|'center'|'right'
 *  muted       - use c.textMuted color
 *  primary     - use c.primary color
 *  error       - use c.error color
 *  numberOfLines
 *  style       - extra TextStyle
 */
const AppText = ({
  children,
  variant = 'body',
  color,
  weight,
  align,
  muted  = false,
  primary = false,
  error  = false,
  numberOfLines,
  style,
  ...rest
}) => {
  const { current_theme: c, theme } = useThemeProvider();
  const { typography } = theme;

  // ── Variant → typography token ──────────────────────────────────────────
  const variantMap = {
    h1:      typography.h1,
    h2:      typography.h2,
    h3:      typography.h3,
    body:    typography.body,
    sm:      typography.sm,
    xs:      typography.xs,
    label:   { fontSize: typography.sm?.fontSize  ?? 13, fontWeight: '700' },
    caption: { fontSize: typography.xs?.fontSize  ?? 11, fontWeight: '400' },
  };

  const variantStyle = variantMap[variant] ?? variantMap.body;

  // ── Color priority: error > primary > muted > custom > default ──────────
  const resolvedColor = error
    ? c.error
    : primary
    ? c.primary
    : muted
    ? c.textMuted
    : color ?? c.text;

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontSize:   variantStyle.fontSize,
          fontWeight: weight ?? variantStyle.fontWeight ?? '400',
          color:      resolvedColor,
          textAlign:  align,
        },
        style,
      ]}
      {...rest}>
      {children}
    </Text>
  );
};

export default AppText;