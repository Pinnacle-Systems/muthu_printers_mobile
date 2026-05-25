
import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, CheckCircle, Circle, ArrowRight, AlertCircle } from 'lucide-react-native';
import useThemeProvider from '../../Theme/useThemeProvider.jsx';
import AppText from '../../components/Text.jsx';
import AppSearchableDropdown from '../../components/AppSearchableDropdown.jsx';
import AppButton from '../../components/AppButton.jsx';
import { useGetJobCardQuery } from '../../redux/api/jobcard.js';


const ProcessRouteTimeline = ({ allProcessRoutes = [], currentRoute, c, spacing }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
      {allProcessRoutes.map((route, index) => {
        const isCompleted = route?.status === 'COMPLETED';
        const isCurrent   = route?.id === currentRoute?.id;
        const isLast      = index === allProcessRoutes.length - 1;

        return (
          <View key={route?.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>

            {/* Process name */}
            <AppText
              variant="sm"
              style={{
                color     : isCompleted ? c.primary : isCurrent ? c.text : c.textMuted,
                fontWeight: isCurrent ? '700' : isCompleted ? '600' : '400',
              }}>
              {route?.Process?.name ?? `Step ${index + 1}`}
            </AppText>

            {/* Arrow */}
            {!isLast && (
              <ArrowRight size={12} color={isCompleted ? c.primary : c.textMuted} />
            )}
          </View>
        );
      })}
    </View>
  );
};


const InfoRow = ({ label, children, c, spacing, styles }) => (
  <View style={styles.infoRow}>
    <AppText variant="sm" style={{ color: c.textMuted, fontWeight: '600', flex: 0.45 }}>
      {label}
    </AppText>
    <View style={{ flex: 0.55 }}>
      {children}
    </View>
  </View>
);


const ActionButton = ({ label, onPress, disabled, color, c, styles }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.actionBtn,
      {
        borderColor    : disabled ? c.border : color,
        opacity        : disabled ? 0.4 : 1,
      },
    ]}>
    <AppText style={{ color: disabled ? c.textMuted : color, fontWeight: '700', fontSize: 18 }}>
      {label}
    </AppText>
  </TouchableOpacity>
);


function JobCardProcess({ navigation, route }) {
  const { jobCardId, id } = route?.params ?? {};

  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, radius, typography, iconSize, Screens } = theme;
  const { wp, hp } = Screens;
  const styles = makeStyles(c, spacing, radius);

  const { data: jobcardRes, isLoading } = useGetJobCardQuery(
    { id },
    { skip: !id }
  );

  const jobcard = jobcardRes?.data;

 
  const currentRoute = jobcard?.processRoute;

  const allProcessRoutes = jobcard?.allProcessRoutes ?? [];


  const allocationDtls  = currentRoute?.productionAllocationDtls ?? [];
  const firstAllocation = allocationDtls?.[0];
  const canStart        = firstAllocation?.isInHouse === true;


  const machineOptions = useMemo(() =>
    jobcard?.machineDetails?.map((m) => ({
      label: m?.Machine?.name,
      value: m?.Machine?.id,
    })) ?? [],
    [jobcard]
  );

  const [selectedMachine, setSelectedMachine] = React.useState(null);


  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={c.primary} size="large" />
      </View>
    );
  }

  if (!jobcard) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', gap: 12 }]}>
        <AlertCircle size={40} color={c.textMuted} />
        <AppText variant="sm" muted>Job Card not found</AppText>
      </View>
    );
  }


  if (!canStart && currentRoute) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', gap: 12, padding: spacing.xl }]}>
        <AlertCircle size={40} color={c.error ?? '#FF4444'} />
        <AppText align="center" style={{ color: c.error ?? '#FF4444', fontWeight: '700' }}>
          Not Allowed
        </AppText>
        <AppText variant="sm" muted align="center">
          This process is not configured as In-House. Cannot start production.
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}>

     
      <View style={styles.card}>

        <InfoRow label="Job Card ID" c={c} spacing={spacing} styles={styles}>
          <AppText style={{ color: c.textMuted }}>{jobcard?.docId ?? jobCardId}</AppText>
        </InfoRow>

        <View style={styles.divider} />

        <InfoRow label="Customer" c={c} spacing={spacing} styles={styles}>
          <AppText style={{ color: c.textMuted }}>
            {jobcard?.customer?.name ?? '—'}
          </AppText>
        </InfoRow>

        <View style={styles.divider} />

       
        <InfoRow label="Process Route" c={c} spacing={spacing} styles={styles}>
          <ProcessRouteTimeline
            allProcessRoutes={allProcessRoutes}
            currentRoute={currentRoute}
            c={c}
            spacing={spacing}
          />
        </InfoRow>

        <View style={styles.divider} />

        <InfoRow label="Process" c={c} spacing={spacing} styles={styles}>
          <AppText style={{ color: c.textMuted }}>
            {currentRoute?.Process?.name ?? '—'}
          </AppText>
        </InfoRow>

        <View style={styles.divider} />

        <InfoRow label="Current Status" c={c} spacing={spacing} styles={styles}>
          <AppText style={{ color: c.textMuted }}>
            {currentRoute?.status
              ? currentRoute.status.replace('_', ' ')
              : '—'}
          </AppText>
        </InfoRow>

      </View>

      
      <View style={styles.section}>
        <AppText variant="sm" muted style={{ marginBottom: spacing.sm }}>
          Available Machines
        </AppText>
        <AppSearchableDropdown
          widthPercent={90}
          options={machineOptions}
          label="Select Machine"
          value={selectedMachine}
          onChange={(opt) => setSelectedMachine(opt.value)}
          placeholder="Select Machine"
        />
      </View>

    
      <View style={styles.actionRow}>
        <ActionButton
          label="Start"
          color={c.primary ?? '#22C55E'}
          disabled={!canStart || !selectedMachine}
          c={c}
          styles={styles}
          onPress={() => {
           
          }}
        />
        <ActionButton
          label="Stop"
          color={c.primary ?? '#22C55E'}
          disabled={!canStart}
          c={c}
          styles={styles}
          onPress={() => {
      
          }}
        />
      </View>

      {canStart && !selectedMachine && (
        <AppText variant="sm" muted align="center" style={{ marginTop: 8 }}>
          Please select a machine to start
        </AppText>
      )}

    </ScrollView>
  );
}


const makeStyles = (c, spacing, radius) =>
  StyleSheet.create({
    container: {
      flex:            1,
      backgroundColor: c.background,
      paddingHorizontal: spacing.md,
    },

    // ─── Info Card ────────────────────
    card: {
      backgroundColor: c.surface,
      borderRadius:    radius.md,
      borderWidth:     1.5,
      borderColor:     c.border,
      marginTop:       spacing.md,
      overflow:        'hidden',
    },
    infoRow: {
      flexDirection:   'row',
      alignItems:      'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    divider: {
      height:          1,
      backgroundColor: c.border,
    },

    // ─── Section ──────────────────────
    section: {
      marginTop:       spacing.lg,
      alignItems:      'center',
    },

    // ─── Action Buttons ───────────────
    actionRow: {
      flexDirection:  'row',
      justifyContent: 'center',
      gap:            spacing.xl,
      marginTop:      spacing.xl * 2,
    },
    actionBtn: {
      width:          130,
      height:         130,
      borderRadius:   65,
      borderWidth:    4,
      alignItems:     'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
  });

export default JobCardProcess;