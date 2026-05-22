import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import useThemeProvider from '../Theme/useThemeProvider';

/**
 * AppDropdown
 * Props:
 *  label            - label shown above the dropdown (optional)
 *  placeholder      - placeholder text when nothing is selected
 *  options          - array of { label: string, value: any }
 *  value            - currently selected value
 *  onChange         - callback(selectedOption) when an option is picked
 *  leftIcon         - lucide-react-native icon component (left side)
 *  error            - error message string shown below
 *  disabled         - disables interaction
 *  widthPercent     - trigger + sheet width as % of screen e.g. 90 → wp(90)
 *                     omit for full width (default behaviour)
 *  containerStyle   - extra style for wrapper View
 */
const AppDropdown = ({
  label,
  placeholder = 'Select an option',
  options = [],
  value,
  onChange,
  leftIcon: LeftIcon,
  error,
  disabled = false,
  widthPercent,
  containerStyle,
}) => {
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, typography, radius, Screens } = theme;
  const { wp } = Screens;

  // ── Resolved width ──────────────────────────────────────────────────────
  // widthPercent=90  →  wp(90)  →  e.g. 342px
  // widthPercent omitted  →  undefined  →  full width
  const resolvedWidth = widthPercent ? wp(widthPercent) : undefined;

  const selectedOption = options.find(o => o.value === value);

  const borderColor = !!error
    ? c.error
    : open
    ? c.primary
    : c.border;

  const iconColor = open ? c.textMuted : c.placeHolder_text;

  const toggleOpen = () => {
    if (disabled) return;
    const toValue = open ? 0 : 1;
    Animated.timing(rotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setOpen(prev => !prev);
  };

  const handleSelect = option => {
    onChange?.(option);
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setOpen(false);
  };

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>

      {/* ── Optional label ─────────────────────────────────────────────── */}
      {!!label && (
        <Text
          style={[
            styles.label,
            {
              fontSize: typography.sm.fontSize,
              color: c.textMuted,
              marginBottom: spacing.xs,
              marginLeft: spacing.xs,
            },
          ]}>
          {label}
        </Text>
      )}

      {/* ── Trigger row ────────────────────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.7}
        onPress={toggleOpen}
        style={[
          styles.triggerWrap,
          {
            backgroundColor: disabled ? c.surfaceDisabled ?? c.surface : c.surface,
            borderColor,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            height: 50,
            opacity: disabled ? 0.5 : 1,
            // ✅ apply wp width when provided, otherwise stretch full width
            width: resolvedWidth,
            alignSelf: resolvedWidth ? 'center' : 'auto',
          },
        ]}>
        {LeftIcon && (
          <LeftIcon size={17} color={iconColor} style={styles.leftIcon} />
        )}

        <Text
          numberOfLines={1}
          style={[
            styles.triggerText,
            {
              fontSize: typography.body.fontSize,
              fontWeight: typography.body.fontWeight,
              color: selectedOption ? c.text : c.placeHolder_text,
              flex: 1,
            },
          ]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <ChevronDown size={17} color={iconColor} />
        </Animated.View>
      </TouchableOpacity>

      {/* ── Error message ──────────────────────────────────────────────── */}
      {!!error && (
        <Text
          style={[
            styles.errorText,
            {
              fontSize: typography.sm.fontSize,
              color: c.error,
              marginTop: spacing.xs,
              marginLeft: spacing.xs,
            },
          ]}>
          {error}
        </Text>
      )}

      {/* ── Dropdown Modal ─────────────────────────────────────────────── */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => {
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
          setOpen(false);
        }}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => {
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
            setOpen(false);
          }}>
          <View
            style={[
              styles.dropdownSheet,
              {
                backgroundColor: c.surface,
                borderRadius: radius.md,
                borderColor: c.border,
                // ✅ sheet matches trigger width; falls back to margin-based full width
                width: resolvedWidth ?? undefined,
                alignSelf: resolvedWidth ? 'center' : 'auto',
                marginHorizontal: resolvedWidth ? 0 : spacing.md,
              },
            ]}>
            <FlatList
              data={options}
              keyExtractor={item => String(item.value)}
              bounces={false}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.optionRow,
                      {
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        backgroundColor: isSelected
                          ? c.primaryLight ?? `${c.primary}15`
                          : 'transparent',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.optionText,
                        {
                          fontSize: typography.body.fontSize,
                          color: isSelected ? c.primary : c.text,
                          fontWeight: isSelected ? '600' : '400',
                          flex: 1,
                        },
                      ]}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Check size={15} color={c.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: c.border }]} />
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: '500',
  },
  triggerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  triggerText: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 10,
  },
  errorText: {
    fontWeight: '400',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
  },
  dropdownSheet: {
    maxHeight: 300,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  optionText: {},
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});

export default AppDropdown;