import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';
import useThemeProvider from '../Theme/useThemeProvider';

const LongRunningMachinesModal = memo(({
  visible = false,
  onClose,
  machines = [],
  onViewAll,
  maxDisplay = 3,
}) => {
  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, radius, typography } = theme;

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsExpanded(false);
    }
  }, [visible]);

  const displayMachines = isExpanded ? machines : machines.slice(0, maxDisplay);
  const remainingCount = isExpanded ? 0 : machines.length - maxDisplay;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      
      <View style={styles.overlay}>
        
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: c.surface,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginHorizontal: 24,
              marginVertical: 40,
              width: '85%',
              maxWidth: 400,
              zIndex: 1,
            },
          ]}>

          {/* Close icon */}
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}>
            <X size={18} color={c.textMuted} />
          </TouchableOpacity>

          {/* Header */}
          <View style={[styles.header, { marginBottom: spacing.md }]}>
            <AlertCircle size={24} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={[
              styles.title,
              {
                fontSize: typography.lg?.fontSize ?? 18,
                fontWeight: '700',
                color: c.text,
              }
            ]}>
              Long-Running Machines ({machines.length})
            </Text>
          </View>

          {/* Machine List */}
          <ScrollView style={{ maxHeight: 300, width: '100%' }} showsVerticalScrollIndicator={true}>
            {displayMachines.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.machineItem, 
                  { 
                    borderBottomWidth: index === displayMachines.length - 1 && remainingCount <= 0 ? 0 : 1,
                    borderBottomColor: c.border,
                    paddingVertical: spacing.sm,
                  }
                ]}
              >
                <View style={styles.machineTitleRow}>
                  <Text style={[styles.bullet, { color: c.text }]}>•</Text>
                  <Text style={[
                    styles.machineName, 
                    { 
                      color: c.text,
                      fontSize: typography.body?.fontSize ?? 14,
                      fontWeight: '700',
                    }
                  ]}>
                    {item.machineName} <Text style={{ color: c.textMuted, fontWeight: 'normal' }}>— {item.operator}</Text>
                  </Text>
                </View>
                
                <Text style={[
                  styles.machineDetails, 
                  { 
                    color: c.textMuted,
                    fontSize: typography.sm?.fontSize ?? 12,
                    marginLeft: 12,
                    marginTop: 4,
                  }
                ]}>
                  {item.jobCard} <Text style={{ color: c.border }}>|</Text> {item.duration} <Text style={{ color: c.border }}>|</Text> since {item.since}
                </Text>
              </View>
            ))}

            {/* Remaining Count */}
            {remainingCount > 0 && (
              <View style={[styles.remainingContainer, { paddingVertical: spacing.sm }]}>
                <Text style={[
                  styles.remainingText, 
                  { 
                    color: c.textMuted,
                    fontSize: typography.body?.fontSize ?? 14,
                    fontWeight: '600',
                    fontStyle: 'italic'
                  }
                ]}>
                  + {remainingCount} more
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={[
            styles.footer,
            { 
              marginTop: spacing.md,
              borderTopWidth: 1,
              borderTopColor: c.border,
              paddingTop: spacing.md,
            }
          ]}>
            {!isExpanded && machines.length > maxDisplay ? (
              <TouchableOpacity 
                onPress={() => {
                  setIsExpanded(true);
                }}
                style={styles.actionBtn}
              >
                <Text style={[
                  styles.actionText, 
                  { color: c.primary, fontWeight: '700' }
                ]}>
                  VIEW ALL
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionBtn} />
            )}

            <TouchableOpacity 
              onPress={onClose}
              style={[
                styles.okBtn,
                { backgroundColor: c.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl }
              ]}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>OK</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingRight: 24, // to avoid overlap with close btn
  },
  title: {
    flex: 1,
  },
  machineItem: {
    width: '100%',
  },
  machineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    marginRight: 6,
    fontSize: 16,
    lineHeight: 18,
  },
  machineName: {
    flex: 1,
  },
  machineDetails: {},
  remainingContainer: {
    alignItems: 'flex-start',
    marginLeft: 12,
  },
  remainingText: {},
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  actionText: {
    fontSize: 14,
  },
  okBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LongRunningMachinesModal;
