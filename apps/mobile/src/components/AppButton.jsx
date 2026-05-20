import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import useThemeProvider from '../Theme/useThemeProvider';
import { getVariantStyles, getSizeStyles, getSpinnerColor } from '../Theme/buttonStyles';

const AppButton = ({
  label,
  onPress,
  variant      = 'primary',
  size         = 'md',
  loading      = false,
  disabled     = false,
  icon: Icon,
  iconPosition = 'right',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  const { current_theme, theme } = useThemeProvider();
  const { spacing, typography, radius } = theme;

  const vs           = getVariantStyles(current_theme)[variant]  ?? getVariantStyles(current_theme).primary;
  const ss           = getSizeStyles({ spacing, typography })[size] ?? getSizeStyles({ spacing, typography }).md;
  const spinnerColor = getSpinnerColor(variant, current_theme);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          height:            ss.height,
          paddingHorizontal: ss.paddingHorizontal,
          borderRadius:      radius.md,
          backgroundColor:   vs.bg,
          borderWidth:       vs.borderWidth,
          borderColor:       vs.borderColor,
          opacity:           isDisabled ? 0.45 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}>
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.content}>
          {Icon && iconPosition === 'left' && (
            <Icon size={ss.fontSize + 2} color={vs.labelColor} style={styles.iconLeft} />
          )}
          <Text
            style={[
              styles.label,
              {
                fontSize:   ss.fontSize,
                fontWeight: typography.body.fontWeight,
                color:      vs.labelColor,
              },
              textStyle,
            ]}>
            {label}
          </Text>
          {Icon && iconPosition === 'right' && (
            <Icon size={ss.fontSize + 2} color={vs.labelColor} style={styles.iconRight} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base:     { alignItems: 'center', justifyContent: 'center' },
  content:  { flexDirection: 'row', alignItems: 'center' },
  label:    { letterSpacing: 0.4 },
  iconLeft:  { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});

export default AppButton;