
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ChevronLeft, CheckCircle, Circle, ArrowRight, AlertCircle } from 'lucide-react-native';
import useThemeProvider from '../../Theme/useThemeProvider.jsx';
import AppText from '../../components/Text.jsx';
import AppSearchableDropdown from '../../components/AppSearchableDropdown.jsx';
import AppButton from '../../components/AppButton.jsx';
import JOBCARD_API, { useGetDepmachinesQuery, useGetJobCardQuery } from '../../redux/api/jobcard.js';
import { useUpdateProcessMutation, useUpdatePushProcessMutation } from '../../redux/api/process.js';
import { logError } from '../../Utils/crashLogger.js';
import { useDispatch } from 'react-redux';
import { useAppModal } from '../../app/providers/AppModalProvider.jsx';


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
                color     : isCompleted ? c.btnprimary : isCurrent ? c.text : c.textMuted,
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
  const { jobCardDocId, id , dep, processId ,machineId_,userId , punch_data_} = route?.params ?? {};
  const dispatch = useDispatch()
   const [punchId, setpunchId ] = useState(null)
   const [pauseable,setpauseable] = useState(false)
   const [resumable , setresumable] =useState(false)
   const [lockmachine,setlockmachine]=useState(false)
  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, radius, typography, iconSize, Screens } = theme;
  const { wp, hp } = Screens;
  const styles = makeStyles(c, spacing, radius);
 
    const { showModal } = useAppModal();
  const {data:departmentmachine_data,isLoading : deparmentloading,error} = useGetDepmachinesQuery({id:dep},{skip:!dep})

  const [updateprocess,{data:update_data, isLoading : updateloading}] = useUpdateProcessMutation({})

  const [update_pause_process,{data:update_pause_data, isLoading : update_pause_loading}] = useUpdatePushProcessMutation({})

  const { data: jobcardRes,refetch : refreshjobcard, isLoading ,isError : iserrorgetJobcard , error :  errorjobcard } = useGetJobCardQuery(
    { id,userid:userId,processRouteId : processId },
    { skip: !id }
  );



  const jobcard = jobcardRes?.data;
  var punch_data =  punch_data_  ??  jobcardRes?.data?.punch_data 
  var  machineId = machineId_  ??  jobcardRes?.data?.punch_data?.Machineid
  

  const currentRoute = jobcard?.processRoute;

  const allProcessRoutes = jobcard?.allProcessRoutes ?? [];


  const allocationDtls  = currentRoute?.productionAllocationDtls ?? [];
  const firstAllocation = allocationDtls?.[0];
  const canStart        = firstAllocation?.isInHouse === true;


  const machineOptions = useMemo(() =>
    departmentmachine_data?.data?.machines?.map((m) => ({
      label: m?.name,
      value: m?.id,
    })) ?? [],
    [jobcard,dep]
  );

  const [selectedMachine, setSelectedMachine] = React.useState(null);



  useEffect(() => {
    if (iserrorgetJobcard && !isLoading) {
      const errMsg = errorjobcard?.data?.message
        ?? errorjobcard?.message
        ?? 'Failed to load job card. Please try again.';
      showModal({
        title:        'Job Card Error',
        message:    JSON?.stringify(errMsg),
        type:         'error',
        confirmLabel: 'Go Back',
        onConfirm:    () => navigation.navigate('HOME'),
      });
    }
  }, [iserrorgetJobcard, isLoading]);

   async function startProcess(){

    try {

    var updatep = await updateprocess({ status : "IN_PROGRESS", jobcardId : id,  processId : processId , flag : "START", departmentId:dep, machineId:selectedMachine, userId :userId , id : 0 })?.unwrap()
    
  
    if(updatep?.statusCode == 0 ||  updatep?.message) {
     return  Alert?.alert("Error",JSON?.stringify(updatep?.message))
     }
    
     setpauseable(true)
    // refreshjobcard()
    dispatch(JOBCARD_API.util.invalidateTags(["JobCard"]))
    

   } catch (error) {

       Alert?.alert("Failed",JSON?.stringify(error))
       logError("Job Card Process","startProcess" , "Start-Process","Punch Failed",error)
    }
  
   }


   async function stopProcess() {
  
     try {
    const punch_id = update_data?.data?.addMain_punch_log?.id ?? punchId

     if(!punch_id) return Alert?.alert("Warning","Punch Id is Missing please refresh!")

    var updatep = await updateprocess({ status : "COMPLETED", jobcardId : id,  processId : processId , flag : "STOP", userId :userId , id : punch_id })?.unwrap()
    
  
    if(updatep?.statusCode == 0 || updatep?.message){
     return  Alert?.alert("Error",JSON?.stringify(updatep?.message)) 
     }

    
     // refreshjobcard()
    dispatch(JOBCARD_API.util.invalidateTags(["JobCard"]))
    navigation?.navigate("HOME")

   } catch (error) {

       Alert?.alert("Failed",JSON?.stringify(error))
       logError("Job Card Process","stopProcess" , "Stop-Process","Punch Failed",error)
    }

    
   }

    async function PauseProcess() {
  
     try {
    const punch_id = update_data?.data?.addMain_punch_log?.id ?? punchId

     if(!punch_id) return Alert?.alert("Warning","Punch Id is Missing please refresh!")

     var updatepause = await update_pause_process({  flag : "PAUSE", userId :userId , id : punch_id ,productionlogid : punch_data?.id })?.unwrap()
    
  
    if(updatepause?.statusCode == 0 || updatepause?.message){
     return  Alert?.alert("Error",JSON?.stringify(updatepause?.message)) 
     }

     // refreshjobcard()
     setresumable(true)
    dispatch(JOBCARD_API.util.invalidateTags(["JobCard"]))
    // navigation?.navigate("HOME")

   } catch (error) {

       Alert?.alert("Failed",JSON?.stringify(error))
       logError("Job Card Process","PauseProcess" , "pause-Process","Punch Failed",error)
    }

    
    }


    async function ResumeProcess() {
  
     try {
    const punch_id = update_data?.data?.addMain_punch_log?.id ?? punchId

     if(!punch_id) return Alert?.alert("Warning","Punch Id is Missing please refresh!")

     var updatepause = await update_pause_process({  flag : "RESUME", userId :userId , id : punch_id ,productionlogid : punch_data?.id })?.unwrap()
    
  
    if(updatepause?.statusCode == 0 || updatepause?.message){
     return  Alert?.alert("Error",JSON?.stringify(updatepause?.message)) 
     }
    setresumable(false)
    setpauseable(true)
     // refreshjobcard()
    dispatch(JOBCARD_API.util.invalidateTags(["JobCard"]))
    // navigation?.navigate("HOME")

   } catch (error) {

       Alert?.alert("Failed","Resume Process Failed to Proceed.")
       logError("Job Card Process","PauseProcess" , "pause-Process","Punch Failed",error)
    }

    
    }

 

 


useEffect(()=>{

  if(machineId){
    setSelectedMachine(machineId)
    setlockmachine(true)
  }
  if(punch_data?.id){
   var resumecheck = punch_data?.pushLogs?.findLast((flast)=>!flast?.resumetime)
   setpunchId(punch_data?.id)
   if(resumecheck){ setresumable(true) }else{  setpauseable(true) }
   

  }

},[machineId,punch_data])

  useEffect(()=>{
  if (!update_data) return; 
  const punch_id = update_data?.data?.addMain_punch_log
  setpunchId(punch_id?.id) 
  if(punch_id?.id) setlockmachine(true)
  
  },[update_data])


  if (isLoading || deparmentloading || updateloading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={c.primary} size="large" />
      </View>
    );
  }


// if(iserrorgetJobcard && !isLoading){
//      showModal({
//     title:        'Jobacrd',
//     message:      JSON?.stringify(error),
//     type:         'warning',
//     confirmLabel: 'ok',
  
//     onConfirm:    () => { 
//   navigation.navigate("HOME")
//     },
//   });

//   return  <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', gap: 12 }]}>
//         <AlertCircle size={40} color={c.textMuted} />
//         <AppText variant="sm" muted>Job Card getting Error</AppText>
//       </View>
//    }


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
          disabled={lockmachine}
          value={selectedMachine}
          onChange={(opt) => setSelectedMachine(opt.value)}
          placeholder="Select Machine"
        />
      </View>

    
      <View style={styles.actionRow}>

        {
          pauseable && !resumable ? <ActionButton
          label="Pause"
          color={c.secprimary ?? '#22C55E'}
          disabled={!canStart || !selectedMachine}
          c={c}
          styles={styles}
          onPress={PauseProcess}
        /> : 
        
        
        ( !resumable ? <ActionButton
          label="Start"
          color={c.btnprimary ?? '#22C55E'}
          disabled={!canStart || !selectedMachine}
          c={c}
          styles={styles}
          onPress={startProcess}
        />  : <ActionButton
          label="Resume"
          color={c.btnprimary ?? '#22C55E'}
          disabled={!canStart || !selectedMachine}
          c={c}
          styles={styles}
          onPress={ResumeProcess}
        />   )
        }
       
        <ActionButton
          label="Stop"
          color={c.btnprimary ?? '#22C55E'}
          disabled={!canStart || resumable}
          c={c}
          styles={styles}
        onPress={stopProcess}
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