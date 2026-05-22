import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react-native';
import useThemeProvider from '../Theme/useThemeProvider';

/**
 * AppTable
 *
 * Props:
 *  columns          - array of column config objects:
 *                     {
 *                       key: string,
 *                       title: string,
 *                       width?: number,       // fixed px width (takes priority)
 *                       flex?: number,        // relative weight (default 1)
 *                       minWidth?: number,    // min px width (default 80)
 *                       align?: 'left'|'center'|'right',
 *                       sortable?: boolean,
 *                       render?: (value, row, index) => ReactNode
 *                     }
 *  data             - array of row objects
 *  keyExtractor     - (row, index) => string
 *  onRowPress       - (row, index) => void
 *  loading          - shows loading spinner overlay
 *  emptyText        - text shown when data is empty
 *  sortable         - enable column sorting globally
 *  striped          - alternate row shading
 *  showIndex        - prepend # index column
 *  maxHeight        - constrain body height — header stays sticky (default 300)
 *  widthPercent     - table width as % of screen e.g. 90 → wp(90)
 *  containerStyle   - extra style for outer wrapper
 *  headerStyle      - extra style for header row
 *  rowStyle         - extra style for each data row
 *  selectedValue    - highlights matched row
 *  selectedKey      - key to match selectedValue against (default: 'id')
 */
const AppTable = ({
  columns = [],
  data = [],
  keyExtractor,
  onRowPress,
  loading = false,
  emptyText = 'No data available',
  sortable = false,
  striped = false,
  showIndex = false,
  maxHeight = 300,
  widthPercent,
  containerStyle,
  headerStyle,
  rowStyle,
  selectedValue,
  selectedKey = 'id',
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, typography, radius, Screens } = theme;
  const { wp } = Screens;

  // ── Resolved table width ───────────────────────────────────────────────
  const tableWidth    = widthPercent ? wp(widthPercent) : Screens.width;
  const DEFAULT_MIN_W = 80;

  // ── Build resolvedWidth for every column ───────────────────────────────
  const allColumns = showIndex
    ? [{ key: '__index', title: '#', width: 44, align: 'center' }, ...columns]
    : columns;

  const fixedTotal = allColumns.reduce((s, col) => s + (col.width ?? 0), 0);
  const flexTotal  = allColumns.reduce((s, col) => s + (!col.width ? (col.flex ?? 1) : 0), 0);
  const flexSpace  = Math.max(tableWidth - fixedTotal, 0);

  const resolvedColumns = allColumns.map(col => {
    if (col.width) return { ...col, resolvedWidth: col.width };
    const share = ((col.flex ?? 1) / flexTotal) * flexSpace;
    return { ...col, resolvedWidth: Math.max(share, col.minWidth ?? DEFAULT_MIN_W) };
  });

  const rowWidth = resolvedColumns.reduce((s, col) => s + col.resolvedWidth, 0);

  // ── Sorting ────────────────────────────────────────────────────────────
  const handleSort = key => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp =
        typeof aVal === 'string'
          ? aVal.localeCompare(bVal)
          : aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sortConfig]);

  // ── Sort icon ──────────────────────────────────────────────────────────
  const SortIcon = ({ colKey }) => {
    const active = sortConfig.key === colKey;
    const color  = active ? c.primary : c.textMuted;
    if (!active) return <ChevronsUpDown size={12} color={color} style={styles.sortIcon} />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp   size={12} color={color} style={styles.sortIcon} />
      : <ChevronDown size={12} color={color} style={styles.sortIcon} />;
  };

  // ── Alignment ──────────────────────────────────────────────────────────
  const flexAlign = align =>
    align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
  const txtAlign = align =>
    align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';

  // ── Render a single header row (shared between sticky + scroll) ────────
  const renderHeader = () => (
    <View
      style={[
        styles.headerRow,
        {
          width:            rowWidth,
          backgroundColor:  c.surfaceAlt ?? `${c.border}55`,
          borderBottomColor: c.border,
        },
        headerStyle,
      ]}>
      {resolvedColumns.map(col => {
        const isIndexCol = col.key === '__index';
        const isSortable = !isIndexCol && (col.sortable ?? sortable);
        return (
          <TouchableOpacity
            key={col.key}
            disabled={!isSortable}
            onPress={() => isSortable && handleSort(col.key)}
            style={[
              styles.headerCell,
              {
                width:             col.resolvedWidth,
                alignItems:        flexAlign(col.align),
                paddingVertical:   spacing.sm,
                paddingHorizontal: spacing.sm,
              },
            ]}>
            <View style={styles.headerContent}>
              <Text
                numberOfLines={1}
                style={[
                  styles.headerText,
                  {
                    fontSize:  typography.sm?.fontSize ?? 12,
                    color:     c.textMuted,
                    textAlign: txtAlign(col.align),
                  },
                ]}>
                {col.title}
              </Text>
              {isSortable && <SortIcon colKey={col.key} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── Render a single data row ───────────────────────────────────────────
  const renderRow = (row, rowIndex) => {
    const key        = keyExtractor ? keyExtractor(row, rowIndex) : String(rowIndex);
    const isSelected = selectedValue !== undefined && row[selectedKey] === selectedValue;
    const isStripe   = striped && rowIndex % 2 === 1;
    const rowBg      = isSelected
      ? c.primaryLight ?? `${c.primary}15`
      : isStripe
      ? c.surfaceAlt ?? `${c.border}30`
      : 'transparent';

    return (
      <TouchableOpacity
        key={key}
        disabled={!onRowPress}
        activeOpacity={onRowPress ? 0.6 : 1}
        onPress={() => onRowPress?.(row, rowIndex)}
        style={[
          styles.dataRow,
          {
            width:             rowWidth,
            backgroundColor:   rowBg,
            borderBottomColor: c.border,
          },
          rowStyle,
        ]}>
        {resolvedColumns.map(col => {
          const isIndexCol = col.key === '__index';
          const cellValue  = isIndexCol ? rowIndex + 1 : row[col.key];
          return (
            <View
              key={col.key}
              style={[
                styles.dataCell,
                {
                  width:             col.resolvedWidth,
                  alignItems:        flexAlign(col.align),
                  paddingVertical:   spacing.sm,
                  paddingHorizontal: spacing.sm,
                },
              ]}>
              {!isIndexCol && col.render ? (
                col.render(cellValue, row, rowIndex)
              ) : (
                <Text
                  numberOfLines={2}
                  style={[
                    styles.cellText,
                    {
                      fontSize:   typography.body?.fontSize ?? 14,
                      color:      isSelected ? c.primary : c.text,
                      fontWeight: isSelected ? '600' : '400',
                      textAlign:  txtAlign(col.align),
                    },
                  ]}>
                  {cellValue != null ? String(cellValue) : '—'}
                </Text>
              )}
            </View>
          );
        })}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderRadius:    radius.md,
          borderColor:     c.border,
          backgroundColor: c.surface,
          width:           widthPercent ? tableWidth : undefined,
          alignSelf:       widthPercent ? 'center' : 'auto',
        },
        containerStyle,
      ]}>

      {/* ── Horizontal scroll wraps BOTH header + body together ─────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}>

        <View>

          {/* ── STICKY header — always visible at top ──────────────────── */}
          {renderHeader()}

          {/* ── Vertical scroll body only ──────────────────────────────── */}
          <ScrollView
            style={{ maxHeight }}
            showsVerticalScrollIndicator={true}
            indicatorStyle="default"
            bounces={false}
            nestedScrollEnabled>

            {sortedData.length === 0 && !loading ? (
              <View style={[styles.emptyWrap, { width: rowWidth, padding: spacing.xl ?? spacing.lg }]}>
                <Text style={{ fontSize: typography.sm?.fontSize ?? 13, color: c.textMuted, textAlign: 'center' }}>
                  {emptyText}
                </Text>
              </View>
            ) : (
              sortedData.map((row, rowIndex) => renderRow(row, rowIndex))
            )}

          </ScrollView>

        </View>
      </ScrollView>

      {/* ── Loading overlay ──────────────────────────────────────────────── */}
      {loading && (
        <View style={[styles.loadingOverlay, { borderRadius: radius.md, backgroundColor: `${c.surface}CC` }]}>
          <ActivityIndicator color={c.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1.5,
    overflow:    'hidden',
  },
  headerRow: {
    flexDirection:    'row',
    borderBottomWidth: 1.5,
  },
  headerCell: {
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  headerText: {
    fontWeight:    '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sortIcon: {
    marginLeft: 3,
  },
  dataRow: {
    flexDirection:    'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dataCell: {
    justifyContent: 'center',
  },
  cellText: {},
  emptyWrap: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems:     'center',
    justifyContent: 'center',
  },
});

export default AppTable;