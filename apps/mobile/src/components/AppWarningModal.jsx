import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react-native';
import useThemeProvider from '../Theme/useThemeProvider';

const AppWarningModal = memo(({
  visible = false,
  onClose,
  onConfirm,
  type = 'warning',
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = null,
  showCancel,
}) => {
  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, radius, typography } = theme;

  const config = {
    warning: {
      icon:        AlertTriangle,
      iconColor:   '#F59E0B',
      bgColor:     '#FEF3C7',
      borderColor: '#F59E0B',
      titleColor:  '#92400E',
    },
    error: {
      icon:        XCircle,
      iconColor:   '#EF4444',
      bgColor:     '#FEE2E2',
      borderColor: '#EF4444',
      titleColor:  '#991B1B',
    },
    success: {
      icon:        CheckCircle,
      iconColor:   '#10B981',
      bgColor:     '#D1FAE5',
      borderColor: '#10B981',
      titleColor:  '#065F46',
    },
    info: {
      icon:        Info,
      iconColor:   '#3B82F6',
      bgColor:     '#DBEAFE',
      borderColor: '#3B82F6',
      titleColor:  '#1E3A8A',
    },
  }[type] ?? {
    icon:        AlertTriangle,
    iconColor:   '#F59E0B',
    bgColor:     '#FEF3C7',
    borderColor: '#F59E0B',
    titleColor:  '#92400E',
  };

  const IconComponent = config.icon;
  const shouldShowCancel = showCancel ?? !!onConfirm;

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>

      {/* ── Overlay ── */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>

        {/* ── Sheet ── */}
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.sheet,
            {
              backgroundColor:  c.surface,
              borderRadius:     radius.lg,
              padding:          spacing.lg,
              marginHorizontal: 24,    // ✅ left/right gap from screen edges
              marginVertical:   40,    // ✅ top/bottom gap
            },
          ]}>

          {/* ── Close icon ── */}
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}>
            <X size={18} color={c.textMuted} />
          </TouchableOpacity>

          {/* ── Icon badge ── */}
          <View style={[
            styles.iconBadge,
            {
              backgroundColor: config.bgColor,
              borderColor:     config.borderColor,
              borderRadius:    radius.full ?? 999,
              padding:         spacing.md,
              marginBottom:    spacing.md,
              marginTop:       spacing.sm,   // ✅ small top gap inside sheet
            },
          ]}>
            <IconComponent size={32} color={config.iconColor} strokeWidth={1.8} />
          </View>

          {/* ── Title ── */}
          {!!title && (
            <Text style={[
              styles.title,
              {
                fontSize:     typography.lg?.fontSize ?? 18,
                fontWeight:   '700',
                color:        config.titleColor,
                marginBottom: spacing.xs,
                textAlign:    'center',
              },
            ]}>
              {title}
            </Text>
          )}

          {/* ── Message ── */}
          {!!message && (
            <Text style={[
              styles.message,
              {
                fontSize:     typography.body?.fontSize ?? 14,
                color:        c.textMuted,
                textAlign:    'center',
                marginBottom: spacing.lg,
                lineHeight:   22,
              },
            ]}>
              {message}
            </Text>
          )}

          {/* ── Buttons ── */}
          <View style={[
            styles.btnRow,
            { gap: spacing.sm },
          ]}>

            {shouldShowCancel && cancelLabel && (
              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.btn,
                  {
                    flex:            1,
                    borderColor:     c.border,
                    borderRadius:    radius.md,
                    paddingVertical: spacing.sm,
                    borderWidth:     1.5,
                    backgroundColor: 'transparent',
                  },
                ]}>
                <Text style={{
                  fontSize:   typography.body?.fontSize ?? 14,
                  fontWeight: '600',
                  color:      c.textMuted,
                  textAlign:  'center',
                }}>
                  {cancelLabel}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                styles.btn,
                {
                  flex:            shouldShowCancel ? 1 : undefined,
                  minWidth:        shouldShowCancel ? undefined : 120,
                  borderRadius:    radius.md,
                  paddingVertical: spacing.sm,
                  backgroundColor: config.iconColor,
                },
              ]}>
              <Text style={{
                fontSize:   typography.body?.fontSize ?? 14,
                fontWeight: '600',
                color:      '#FFFFFF',
                textAlign:  'center',
              }}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  sheet: {
    alignItems:    'center',
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius:  12,
    elevation:     8,
  },
  closeBtn: {
    position: 'absolute',
    top:      12,
    right:    12,
  },
  iconBadge: {
    borderWidth:    1.5,
    alignItems:     'center',
    justifyContent: 'center',       // ✅ fixed: removed invalid function reference
  },
  title:   {},
  message: {},
  btnRow: {
    flexDirection: 'row',
    alignItems:    'center',
    width:         '100%',
  },
  btn: {
    alignItems:     'center',
    justifyContent: 'center',
    minHeight:      44,
  },
});

export default AppWarningModal;