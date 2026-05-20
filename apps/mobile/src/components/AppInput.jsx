import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import useThemeProvider from '../Theme/useThemeProvider';

/**
 * AppInput
 * Props:
 *  placeholder      - input placeholder text
 *  leftIcon         - lucide-react-native icon component (left side)
 *  rightIcon        - lucide-react-native icon component (right side)
 *  onRightIconPress - press handler for right icon
 *  error            - error message string shown below input
 *  isPassword       - enables show/hide password toggle
 *  containerStyle   - extra style for wrapper View
 *  ...rest          - all standard TextInput props
 */
const AppInput = ({
  placeholder,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconPress,
  error,
  isPassword = false,
  containerStyle,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused]       = useState(false);

  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, typography, radius } = theme;

  // ── Derived border color: error > focused > default ──────────────────────
  const borderColor = !!error
    ? c.error
    : isFocused
    ? c.primary
    : c.border;

  // ── Icon color shifts on focus ────────────────────────────────────────────
  const iconColor = isFocused ? c.textMuted : c.placeHolder_text;

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>

      {/* ── Input row ───────────────────────────────────────────────────── */}
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor:  c.surface,
            borderColor,
            borderRadius:     radius.md,
            paddingHorizontal: spacing.md,
            height:           50,
          },
        ]}>

        {LeftIcon && (
          <LeftIcon size={17} color={iconColor} style={styles.leftIcon} />
        )}

        <TextInput
          style={[
            styles.input,
            {
              fontSize:  typography.body.fontSize,
              fontWeight: typography.body.fontWeight,
              color:     c.text,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={c.placeHolder_text}
          secureTextEntry={isPassword ? !showPassword : false}
          onFocus={() => setIsFocused(true)}
          onBlur={()  => setIsFocused(false)}
          {...rest}
        />

        {/* ── Right slot: password toggle OR custom icon ───────────────── */}
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(prev => !prev)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {showPassword
              ? <EyeOff size={17} color={iconColor} />
              : <Eye    size={17} color={iconColor} />}
          </TouchableOpacity>
        ) : RightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <RightIcon size={17} color={iconColor} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ── Error message ───────────────────────────────────────────────── */}
      {!!error && (
        <Text
          style={[
            styles.errorText,
            {
              fontSize:   typography.sm.fontSize,
              color:      c.error,
              marginTop:  spacing.xs,
              marginLeft: spacing.xs,
            },
          ]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row',
    alignItems:   'center',
    borderWidth:  1.5,
  },
  input: {
    flex:   1,
    height: '100%',
  },
  leftIcon:  { marginRight: 10 },
  errorText: { fontWeight: '400' },
});

export default AppInput;