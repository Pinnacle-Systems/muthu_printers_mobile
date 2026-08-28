import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { ChevronDown, Search, Check, X } from "lucide-react-native";
import useThemeProvider from "../Theme/useThemeProvider";

/**
 * AppSearchableDropdown
 * Props:
 *  label            - label shown above the dropdown (optional)
 *  placeholder      - placeholder text when nothing is selected
 *  searchPlaceholder- placeholder inside the search input (default: 'Search...')
 *  options          - array of { label: string, value: any }
 *  value            - currently selected value
 *  onChange         - callback(selectedOption) when an option is picked
 *  leftIcon         - lucide-react-native icon component (left side)
 *  error            - error message string shown below
 *  disabled         - disables interaction
 *  emptyText        - text to show when no results found
 *  clearable        - show X button to clear selection (default: true)
 *  widthPercent     - trigger + sheet width as % of screen  e.g. 90 → wp(90)
 *                     omit for full width (default behaviour)
 *  containerStyle   - extra style for wrapper View
 */
const AppSearchableDropdown = ({
  label,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  options = [],
  value,
  onChange,
  leftIcon: LeftIcon,
  error,
  disabled = false,
  emptyText = "No results found",
  clearable = true,
  widthPercent,
  containerStyle,
  triggerStyle,
  disable_key,
  concat_key,
  concat_prefix,
  concat_subfix,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const searchRef = useRef(null);

  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, typography, radius, Screens } = theme;
  const { wp } = Screens;

  const resolvedWidth = widthPercent ? wp(widthPercent) : undefined;

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((o) =>
      String(o?.label ?? "")
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [query, options]);

  const borderColor = !!error ? c.error : open ? c.primary : c.border;

  const iconColor = open ? c.textMuted : c.placeHolder_text;

  const openDropdown = () => {
    if (disabled) return;
    setQuery("");
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setOpen(true);
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  const closeDropdown = () => {
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setOpen(false);
    setQuery("");
  };

  const handleSelect = (option) => {
    onChange?.(option);
    closeDropdown();
  };

  const handleClear = () => {
    onChange?.(null);
  };

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
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
          ]}
        >
          {label}
        </Text>
      )}

      {/* ── Trigger row ────────────────────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.7}
        onPress={openDropdown}
        style={[
          styles.triggerWrap,
          {
            backgroundColor: disabled
              ? (c.surfaceDisabled ?? c.surface)
              : c.surface,
            borderColor,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            height: 50,
            opacity: disabled ? 0.5 : 1,
            width: resolvedWidth,
            alignSelf: resolvedWidth ? "center" : "auto",
          },
          triggerStyle,
        ]}
      >
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
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        {/* ── Clear button ─────────────────────────────────────────────── */}
        {clearable && !!selectedOption && !disabled && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginRight: 6 }}
          >
            <X size={15} color={iconColor} />
          </TouchableOpacity>
        )}

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
          ]}
        >
          {error}
        </Text>
      )}

      {/* ── Searchable Modal ───────────────────────────────────────────── */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeDropdown}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.sheet,
              {
                backgroundColor: c.surface,
                borderRadius: radius.md,
                borderColor: c.border,
                width: resolvedWidth ?? undefined,
                alignSelf: resolvedWidth ? "center" : "auto",
                marginHorizontal: resolvedWidth ? 0 : spacing.md,
              },
            ]}
          >
            {/* ── Search bar ───────────────────────────────────────────── */}
            <View
              style={[
                styles.searchRow,
                {
                  borderBottomColor: c.border,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                },
              ]}
            >
              <Search size={16} color={c.textMuted} style={styles.searchIcon} />
              <TextInput
                ref={searchRef}
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={c.placeHolder_text}
                style={[
                  styles.searchInput,
                  {
                    fontSize: typography.body.fontSize,
                    color: c.text,
                    flex: 1,
                  },
                ]}
              />
              {query.length > 0 && (
                <TouchableOpacity
                  onPress={() => setQuery("")}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={15} color={c.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* ── Options list ─────────────────────────────────────────── */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.value)}
              bounces={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 260 }}
              ListEmptyComponent={
                <View style={[styles.emptyWrap, { padding: spacing.lg }]}>
                  <Text
                    style={[
                      styles.emptyText,
                      { fontSize: typography.sm.fontSize, color: c.textMuted },
                    ]}
                  >
                    {emptyText}
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    disabled={item?.[disable_key]}
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.optionRow,
                      {
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        backgroundColor: isSelected
                          ? item?.[disable_key]
                            ? c.border
                            : (c.primaryLight ?? `${c.primary}15`)
                          : item?.[disable_key]
                            ? c.border
                            : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          fontSize: typography.body.fontSize,
                          color: isSelected ? c.primary :  item?.[concat_key] && item?.[disable_key]  ? c.error : c.text,
                          fontWeight: isSelected ? "600" : "400",
                          flex: 1,
                        },
                      ]}
                    >
                      {item.label}{" "}
                      {item?.[concat_key] && item?.[disable_key]
                        ? concat_prefix +
                          " " +
                          item?.[concat_key] +
                          " " +
                          concat_subfix
                        : ""}
                    </Text>
                    {isSelected && <Check size={15} color={c.primary} />}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => (
                <View
                  style={[styles.separator, { backgroundColor: c.border }]}
                />
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: "500",
  },
  triggerWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
  },
  triggerText: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 10,
  },
  errorText: {
    fontWeight: "400",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
  },
  sheet: {
    borderWidth: 1.5,
    overflow: "hidden",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    height: 40,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
  },
  optionText: {},
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  emptyWrap: {
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
  },
});

export default AppSearchableDropdown;
