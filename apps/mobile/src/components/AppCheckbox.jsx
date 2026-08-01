import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import useThemeProvider from '../Theme/useThemeProvider';

/**
 * AppCheckbox
 * Props:
 *  label    - label text beside the checkbox
 *  value    - boolean checked state
 *  onChange - callback (val: boolean) => void
 *  size     - 'sm' | 'md' | 'lg'  (default: 'md')
 *  style    - extra style for wrapper
 */

const BOX_SIZE = { sm: 16, md: 18, lg: 22 };
const ICON_SIZE = { sm: 9,  md: 11, lg: 14 };

const AppCheckbox = ({ label, value, onChange, size = 'md', style }) => {
  const { current_theme: c, theme } = useThemeProvider();
  const { typography, radius } = theme;

  const boxSize  = BOX_SIZE[size]  ?? BOX_SIZE.md;
  const iconSize = ICON_SIZE[size] ?? ICON_SIZE.md;

  return (
    <TouchableOpacity
      style={[styles.row, style]}
      onPress={() => onChange(!value)}
      activeOpacity={0.7}>
      <View
        style={[
          styles.box,
          {
            width:           boxSize,
            height:          boxSize,
            borderRadius:    radius.sm,
            borderColor:     value ? c.primary : c.border,
            backgroundColor: value ? c.primary : c.background,
          },
        ]}>
        {value && <Check size={iconSize} color={c.background} strokeWidth={3} />}
      </View>

      {label && (
        <Text
          style={[
            styles.label,
            {
              fontSize: typography.sm.fontSize,
              color:    value ? c.text : c.textMuted,
            },
          ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center' },
  box:   { alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1.5 },
  label: { fontWeight: '400' },
});

export default AppCheckbox;