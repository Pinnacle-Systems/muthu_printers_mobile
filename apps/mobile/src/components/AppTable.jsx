import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import useThemeProvider from '../Theme/useThemeProvider';

/**
 * AppTable
 *
 * Props:
 *  columns          - array of column config objects:
 *                     {
 *                       key: string,
 *                       title: string,
 *                       width?: number,
 *                       flex?: number,
 *                       minWidth?: number,
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
 *  maxHeight        - constrain body height (default 300)
 *  widthPercent     - table width as % of screen
 *  containerStyle   - extra style for outer wrapper
 *  headerStyle      - extra style for header row
 *  rowStyle         - extra style for each data row
 *  selectedValue    - highlights matched row
 *  selectedKey      - key to match selectedValue (default: 'id')
 *
 *  — Pagination —
 *  pagination       - enable pagination (default false)
 *  pageSize         - rows per page (default 10)
 *  pageSizeOptions  - array of page size options (default [5,10,20,50])
 *  totalCount       - total records (required for server-side)
 *  currentPage      - controlled current page (server-side)
 *  onPageChange     - (page, pageSize) => void
 *  serverSide       - disables client-side slice (default false)
 */

const AppTable = ({
  columns = [],
  data = [],
  keyExtractor,
  onRowPress,
  loading          = false,
  emptyText        = 'No data available',
  sortable         = false,
  striped          = false,
  showIndex        = false,
  maxHeight        = 300,
  widthPercent,
  containerStyle,
  headerStyle,
  rowStyle,
  selectedValue,
  selectedKey      = 'id',

  // ─── Pagination ───────────────────────
  pagination       = false,
  pageSize         = 10,
  pageSizeOptions  = [],
  totalCount,
  currentPage,
  onPageChange,
  serverSide       = false,
  refresh=[]
}) => {

  const [sortConfig, setSortConfig]           = useState({ key: null, direction: 'asc' });
  const [internalPage, setInternalPage]       = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);

  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, typography, radius, Screens } = theme;
  const { wp } = Screens;

  // ─── Table width ──────────────────────
  const tableWidth    = widthPercent ? wp(widthPercent) : Screens.width;
  const DEFAULT_MIN_W = 80;

  // ─── Build columns ────────────────────
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

  // ─── Sorting ──────────────────────────
  const handleSort = key => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  };

  const sortedData = useMemo(() => {
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
  }, [data, sortConfig , ...refresh]);

  // ─── Pagination logic ─────────────────
  const activePage     = serverSide ? (currentPage ?? 1) : internalPage;
  const activePageSize = internalPageSize;
  const totalRows      = totalCount ?? sortedData.length;
  const totalPages     = Math.max(1, Math.ceil(totalRows / activePageSize));

  const pagedData = useMemo(() => {
    if (!pagination || serverSide) return sortedData;
    const start = (activePage - 1) * activePageSize;
    return sortedData.slice(start, start + activePageSize);
  }, [sortedData, pagination, serverSide, activePage, activePageSize]);

  const displayData = pagination ? pagedData : sortedData;

  // ─── Page change ──────────────────────
  const goToPage = (page) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    if (serverSide) {
      onPageChange?.(clamped, activePageSize);
    } else {
      setInternalPage(clamped);
    }
  };

  const handlePageSizeChange = (size) => {
    setInternalPageSize(size);
    if (serverSide) {
      onPageChange?.(1, size);
    } else {
      setInternalPage(1);
    }
  };

  // ─── Pagination display info ──────────
  const startRow = totalRows === 0 ? 0 : (activePage - 1) * activePageSize + 1;
  const endRow   = Math.min(activePage * activePageSize, totalRows);

  // ─── Page number buttons ──────────────
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (activePage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (activePage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', activePage - 1, activePage, activePage + 1, '...', totalPages];
  };

  // ─── Helpers ──────────────────────────
  const flexAlign = align =>
    align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';

  const txtAlign = align =>
    align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';

  // ─── Sort icon ────────────────────────
  const SortIcon = ({ colKey }) => {
    const active = sortConfig.key === colKey;
    const color  = active ? c.primary : c.textMuted;
    if (!active) return <ChevronsUpDown size={12} color={color} style={styles.sortIcon} />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp   size={12} color={color} style={styles.sortIcon} />
      : <ChevronDown size={12} color={color} style={styles.sortIcon} />;
  };

  // ─── Header ───────────────────────────
  const renderHeader = () => (
    <View style={[
      styles.headerRow,
      {
        width:             rowWidth,
        backgroundColor:   c.surfaceAlt ?? `${c.border}55`,
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

  // ─── Row ──────────────────────────────
  const renderRow = (row, rowIndex) => {
    const key        = keyExtractor ? keyExtractor(row, rowIndex) : String(rowIndex);
    const isSelected = selectedValue !== undefined && row[selectedKey] === selectedValue;
    const isStripe   = striped && rowIndex % 2 === 1;
    const rowBg      = isSelected
      ? c.primaryLight ?? `${c.primary}15`
      : isStripe
      ? c.surfaceAlt ?? `${c.border}30`
      : 'transparent';

    // ✅ Correct global index across pages
    const globalIndex = (activePage - 1) * activePageSize + rowIndex + 1;

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
          const cellValue  = isIndexCol ? globalIndex : row[col.key];
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
                      fontSize:   typography.sm?.fontSize ?? 14,
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

  // ─── Pagination UI ────────────────────
  const renderPagination = () => {
    if (!pagination) return null;

    return (
      <View style={[
        styles.paginationWrapper,
        {
          borderTopColor:   c.border,
          backgroundColor:  c.surfaceAlt ?? `${c.border}22`,
          paddingVertical:  spacing.sm,
          paddingHorizontal: spacing.sm,
          gap:              spacing.sm,
        },
      ]}>

        {/* ── Info row + page size selector ── */}
        <View style={styles.paginationTopRow}>

          {/* Showing X–Y of Z */}
          <Text style={[
            styles.paginationInfoText,
            {
              color:    c.textMuted,
              fontSize: typography.sm?.fontSize ?? 12,
            },
          ]}>
            {totalRows === 0
              ? 'No results'
              : `${startRow}–${endRow} of ${totalRows}`}
          </Text>

          {/* Page size buttons */}
         {pageSizeOptions?.length > 0 ?  <View style={styles.pageSizeRow}>
            <Text style={[
              styles.paginationInfoText,
              { color: c.textMuted, fontSize: typography.sm?.fontSize ?? 12 },
            ]}>
              Rows:
            </Text>
            {pageSizeOptions.map(size => (
              <TouchableOpacity
                key={size}
                onPress={() => handlePageSizeChange(size)}
                style={[
                  styles.pageSizeBtn,
                  {
                    backgroundColor: activePageSize === size
                      ? c.primary
                      : `${c.border}44`,
                    borderRadius: radius.sm ?? 4,
                  },
                ]}>
                <Text style={[
                  styles.pageSizeBtnText,
                  {
                    color:      activePageSize === size ? '#fff' : c.textMuted,
                    fontSize:   typography.sm?.fontSize ?? 12,
                    fontWeight: activePageSize === size ? '700' : '400',
                  },
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>  : <></>}

        </View>

        {/* ── Page number buttons ── */}
        <View style={styles.pageButtonsRow}>

          {/* Prev */}
          <TouchableOpacity
            disabled={activePage === 1}
            onPress={() => goToPage(activePage - 1)}
            style={[
              styles.pageNavBtn,
              {
                backgroundColor: `${c.border}44`,
                borderRadius:    radius.sm ?? 4,
                opacity:         activePage === 1 ? 0.4 : 1,
              },
            ]}>
            <ChevronLeft size={14} color={c.text} />
          </TouchableOpacity>

          {/* Numbers */}
          {getPageNumbers().map((page, idx) =>
            page === '...' ? (
              <Text
                key={`dots-${idx}`}
                style={[
                  styles.paginationInfoText,
                  { color: c.textMuted, paddingHorizontal: 4 },
                ]}>
                …
              </Text>
            ) : (
              <TouchableOpacity
                key={`page-${page}`}
                onPress={() => goToPage(page)}
                style={[
                  styles.pageNumBtn,
                  {
                    backgroundColor: activePage === page
                      ? c.primary
                      : `${c.border}44`,
                    borderRadius: radius.sm ?? 4,
                  },
                ]}>
                <Text style={[
                  styles.pageNumText,
                  {
                    color:      activePage === page ? '#fff' : c.text,
                    fontSize:   typography.sm?.fontSize ?? 12,
                    fontWeight: activePage === page ? '700' : '400',
                  },
                ]}>
                  {page}
                </Text>
              </TouchableOpacity>
            )
          )}

          {/* Next */}
          <TouchableOpacity
            disabled={activePage === totalPages}
            onPress={() => goToPage(activePage + 1)}
            style={[
              styles.pageNavBtn,
              {
                backgroundColor: `${c.border}44`,
                borderRadius:    radius.sm ?? 4,
                opacity:         activePage === totalPages ? 0.4 : 1,
              },
            ]}>
            <ChevronRight size={14} color={c.text} />
          </TouchableOpacity>

        </View>

      </View>
    );
  };

  // ─── Main render ──────────────────────
  return (
    <View style={[
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

      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}>
        <View>

          {/* Sticky header */}
          {renderHeader()}

          {/* Vertical scroll body */}
          <ScrollView
            style={{ maxHeight }}
            showsVerticalScrollIndicator
            indicatorStyle="default"
            bounces={false}
            nestedScrollEnabled>

            {displayData.length === 0 && !loading ? (
              <View style={[
                styles.emptyWrap,
                { width: rowWidth, padding: spacing.xl ?? spacing.lg },
              ]}>
                <Text style={{
                  fontSize:  typography.md?.fontSize ?? 13,
                  color:     c.textMuted,
                  textAlign: 'center',
                }}>
                  {emptyText}
                </Text>
              </View>
            ) : (
              displayData.map((row, rowIndex) => renderRow(row, rowIndex))
            )}

          </ScrollView>

        </View>
      </ScrollView>

      {/* Pagination */}
      {renderPagination()}

      {/* Loading overlay */}
      {loading && (
        <View style={[
          styles.loadingOverlay,
          {
            borderRadius:    radius.md,
            backgroundColor: `${c.surface}CC`,
          },
        ]}>
          <ActivityIndicator color={c.primary} />
        </View>
      )}

    </View>
  );
};

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1.5,
    overflow:    'hidden',
  },

  // ─── Header ───────────────────────────
  headerRow: {
    flexDirection:     'row',
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

  // ─── Rows ─────────────────────────────
  dataRow: {
    flexDirection:     'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dataCell: {
    justifyContent: 'center',
  },
  cellText: {},

  // ─── Empty ────────────────────────────
  emptyWrap: {
    alignItems:     'center',
    justifyContent: 'center',
  },

  // ─── Loading ──────────────────────────
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems:     'center',
    justifyContent: 'center',
  },

  // ─── Pagination ───────────────────────
  paginationWrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  paginationTopRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    flexWrap:       'wrap',
    gap:            6,
  },
  paginationInfoText: {
    fontWeight: '400',
  },
  pageSizeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  pageSizeBtn: {
    paddingHorizontal: 8,
    paddingVertical:   4,
  },
  pageSizeBtnText: {},
  pageButtonsRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    flexWrap:       'wrap',
    gap:            4,
  },
  pageNavBtn: {
    width:          28,
    height:         28,
    alignItems:     'center',
    justifyContent: 'center',
  },
  pageNumBtn: {
    minWidth:          28,
    height:            28,
    paddingHorizontal: 6,
    alignItems:        'center',
    justifyContent:    'center',
  },
  pageNumText: {},
});

export default AppTable;