import React, { useEffect, useState, memo, useContext, useCallback, useMemo, useRef } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { ScanBarcode } from "lucide-react-native";
import useThemeProvider from "../../Theme/useThemeProvider";
import AppButton from "../../components/AppButton.jsx";
import AppText from "../../components/Text.jsx";
import AppSearchableDropdown from "../../components/AppSearchableDropdown.jsx";
import AppTable from "../../components/AppTable.jsx";
import { useDepartmentHooks } from "../../services/hooks/useDepartmentHooks.jsx";
import { useJobCardHooks } from "../../services/hooks/useJobCardHooks.jsx";
import QRScanner from "../../components/QRScanner.jsx";
import AppModal from "../../components/AppModal.jsx";
import { AuthContext } from "../../app/providers/AppProviders.jsx";
import { useDispatch } from "react-redux";
import { Pencil, X, ExternalLink } from "lucide-react-native";
import JOBCARD_API, { useGetTakenJobcardQuery } from "../../redux/api/jobcard.js";
import { useUpdateCurrentProcessMutation } from "../../redux/api/process.js";
import { logError } from "../../Utils/crashLogger.js";
import { useAppModal } from "../../app/providers/AppModalProvider.jsx";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";


const Header = memo(({ setshowscanner, iconSize, spacing, wp, hp,selected, c }) => (
  <View style={{
    height:         hp(20),
    padding:        spacing.md,
    flexDirection:  "column",
    gap:            20,
    alignItems:     "center",
    justifyContent: "center",
    marginTop:      spacing.md,
  }}>
    <MaterialIcons
      name="qr-code-scanner"
      size={iconSize.mxl}
      color={c.text}
      style={{ marginTop: 10 }}
    />
    <AppButton
      style={{ width: wp(90) }}
      onPress={() =>{
       if(!selected) return Alert?.alert("Permission","Permission Denied Please Select Department!");
      setshowscanner(true)
      }}
      label="Scan Job Card"
    />
  </View>
));


const TABS = [
  { key: "pending",   label: "Available"   },
  { key: "completed", label: "Completed" },
];

const Body = memo(({
  iconSize, spacing, wp, hp, c,
  dropdown, table, completedtable,
  navigation, user, onWarning,
  activeTab, setActiveTab,        
  localStatusUpdates, onSaveChanges, isSaving,
  setdepName,depName
}) => (
  <View style={{
    minHeight:     hp(80),
    padding:       spacing.md,
    flexDirection: "column",
    gap:           20,
    alignItems:    "center",
    justifyContent:"flex-start",
  }}>

    <AppSearchableDropdown
      widthPercent={90}
      disabled={dropdown?.isLoading}
      options={dropdown?.options}
      label="Select Department"
      value={dropdown?.selected}
      onChange={option =>{

     dropdown?.setSelected(option ? option.value : null)
     dropdown?.setdepName(option ? option.label : null)
    
      }}
      placeholder="Select Department"
      clearable
    />

    {/* ── Tab Toggle ── */}
    <View style={{
      flexDirection:   "row",
      width:           wp(90),
      borderRadius:    8,
      borderWidth:     1,
      borderColor:     c.border,
      overflow:        "hidden",
    }}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              flex:            1,
              paddingVertical: 10,
              alignItems:      "center",
              backgroundColor: isActive ? c.primary : c.surface,
            }}
          >
            <AppText
              variant="sm"
              style={{
                color:      isActive ? c.background : c.text,
                fontWeight: isActive ? "600" : "400",
              }}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>

    {/* ── Conditional Table ── */}
    {activeTab === "pending" ? (
      <>
      <AppTable
        key="pending"
        widthPercent={90}
        maxHeight={hp(55)}
        minHeight={hp(35)}
        columns={table?.columns}
        data={table?.data}
        loading={table?.isLoading}
        striped
        sortable
        refresh={[dropdown?.selected]}
        pagination
        serverSide
        currentPage={table?.page}
        totalCount={table?.totalCount}
        pageSize={table?.perPage}
        onPageChange={table?.onPageChange}
        rowStyle={table?.rowStyle}
        onRowPress={row => {
          if (!dropdown?.selected) return onWarning();
          
          const highPriorityJob = table?.data?.find(j => j?.priority && String(j.priority).toUpperCase() === 'HIGH');
          const isCurrentHighPriority = row?.priority && String(row.priority).toUpperCase() === 'HIGH';
          
          const proceed = () => {
            if (!row?.id || !dropdown?.selected || !row?.processId || !user?.id) {
              return Alert.alert("Missing Data", "Required job card data is incomplete. Please try again.");
            }
            navigation?.navigate("JOB", {
              jobCardDocId: row?.jobCardId,
              id:           row?.id,
              dep:          dropdown?.selected,
              processId:    row?.processId,
              userId:       user?.id,
            });
          };

          if (highPriorityJob && !isCurrentHighPriority) {
            Alert.alert(
              "High Priority Job",
              `Job ${highPriorityJob.jobCardId} is high priority. Please select Job ${highPriorityJob.jobCardId}`,
              [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: proceed }
              ]
            );
          } else {
            proceed();
          }
        }}
      />
      {Object.keys(localStatusUpdates || {}).length > 0 && (
         <AppButton 
           label={isSaving ? "Saving..." : "Save Changes"} 
           onPress={onSaveChanges}
           disabled={isSaving}
           style={{ width: wp(90), marginTop: 10 }}
         />
      )}
      </>
    ) : (
      <AppTable
        key="completed"
        widthPercent={90}
        maxHeight={hp(55)}
        minHeight={hp(35)}
        columns={completedtable?.columns}
        data={completedtable?.data}
        loading={completedtable?.isLoading}
        striped
        sortable
        refresh={[dropdown?.selected]}
        pagination
        serverSide
        currentPage={completedtable?.page}
        totalCount={completedtable?.totalCount}
        pageSize={completedtable?.perPage}
        onPageChange={completedtable?.onPageChange}
        onRowPress={row => {
          // if (!dropdown?.selected) return onWarning();
          // navigation?.navigate("JOB", {
          //   jobCardDocId: row?.jobCardId,
          //   id:           row?.id,
          //   dep:          dropdown?.selected,
          //   processId:    row?.processId,
          //   userId:       user?.id,
          //   viewOnly:     true,   // completed jobs → read-only
          // });
        }}
      />
    )}

  </View>
));


const convertDepartmentData = (data) =>
  data?.map((dep) => ({ label: dep?.name, value: dep?.id }));

const convertJobCardData = (data, department) =>
  data
    ?.filter(fdata => {
      if (!department) return true;
      const dept = fdata?.processRoute?.Process;
      return String(dept?.departmentId) === String(department);
    })
    ?.map((job) => ({
      jobCardId:    job?.docId,
      currentState: job?.processRoute?.status,
      process:      job?.processRoute?.Process?.name,
      processId:    job?.processRoute?.id,
      id:           job?.id,
      priority:     job?.priority,
      machineDetails: job?.machineDetails
    }));


const convertCompletedJobCardData = (data, department) =>
  data
    ?.map(job => ({
      jobCardId:    job?.docId,
      currentState: "COMPLETED",
      process:      "COMPLETED",
      processId:    job?.processRoute?.id,
      id:           job?.id,
      machineDetails: job?.machineDetails
    }));

const formatStatus = (status) => {
  if (!status) return "-";
  const str = String(status).toUpperCase();
  switch (str) {
    case "IN_PROGRESS": return "IN_PROG";
    case "NOT_STARTED": return "NOT_STD";
    case "COMPLETED":   return "COMPL";
    default:            return str;
  }
};

const isExpectedRequestAbort = (error) =>
  error?.status === "FETCH_ERROR" &&
  /abort/i.test(String(error?.error ?? ""));

export const  HomeScreen = ({ navigation,route } = {}) => {
  const {completed} = route?.params ?? {};
  const { showModal, showWarning } = useAppModal();
  const { userDetails }            = useContext(AuthContext);
  const dispatch                   = useDispatch();
  const [activeTab, setActiveTab] = useState("pending");

  const [selected,   setSelected]   = useState(null);
  const [department,setdepartment] = useState("")
  const [showQrcode, setShowQrcode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page,       setPage]       = useState(1);
  const [perPage,    setPerPage]    = useState(10);
  
  const [localStatusUpdates, setLocalStatusUpdates] = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDetailsRow, setSelectedDetailsRow] = useState(null);

  // ✅ prevents re-navigation after refresh
  const hasNavigated = useRef(false);

  // ── Queries ────────────────────────────────────────────────────────
  const { getDepartments } = useDepartmentHooks();
  const {
    data:      deptData,
    isLoading: isLoadingDep,
    refetch:   refreshdepartment,
  } = getDepartments;

  const { getJobCardList,getJobCardCompletedList } = useJobCardHooks({
    getJobCardList_params: {
      pagination:  true,
      pageNumber:  page,
      dataPerPage: perPage,
    },
  });

  const {
    data:      jobCardData,
    isLoading: isLoadingJobs,
    refetch:   refreshjobcard,
  } = getJobCardList;
  
  const [updateCurrentProcess] = useUpdateCurrentProcessMutation();

  const {  data:      compl_jobCardData,
    isLoading: isLoadingcompl_Jobs,
    refetch:   refreshcompl_jobcard,}=getJobCardCompletedList

  const {
    data:    takendjobdata,
    isLoading: loadingTakendata,
    isError: isErrortaken,
    error:   takencarderror,
  } = useGetTakenJobcardQuery({ userid: userDetails?.id ?? null }, { skip: completed || !userDetails?.id });

  // ── Derived ────────────────────────────────────────────────────────
  const dep_options = convertDepartmentData(deptData?.data);

  // ✅ fixed — both jobCardData and selected in deps
  const jobs = useMemo(
    () => {
      let baseJobs = convertJobCardData(jobCardData?.data, selected) ?? [];
      
      baseJobs.sort((a, b) => {
        const isAHigh = a?.priority && String(a.priority).toUpperCase() === 'HIGH';
        const isBHigh = b?.priority && String(b.priority).toUpperCase() === 'HIGH';
        if (isAHigh && !isBHigh) return -1;
        if (!isAHigh && isBHigh) return 1;
        return 0;
      });

      return baseJobs.map(job => ({
        ...job,
        currentState: localStatusUpdates[job.id] || job.currentState
      }));
    },
    [jobCardData, selected, localStatusUpdates],
  );

  const completed_jobs = useMemo(
    () => convertCompletedJobCardData(compl_jobCardData?.data, selected) ?? [],
    [compl_jobCardData, selected],
  );

  const totalCount = jobs?.length ?? 0;

  const totalComp_Count = completed_jobs?.length ?? 0;

  // ── Refresh ────────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    hasNavigated.current = false;   // ✅ reset guard so taken job re-checked

    try {
      await dispatch(JOBCARD_API.util.invalidateTags(["JobCard"]));
      await refreshdepartment();
      await refreshjobcard();       // ✅ was missing
      await refreshcompl_jobcard();
    } catch (err) {
      logError("HOME SCREEN", "REFRESH", "PULL_REFRESH", err, { message: "Refresh Failed" });
    } finally {
      setRefreshing(false);         // ✅ always stop spinner even on error
    }
  }, []);

  // ── Taken job navigation ───────────────────────────────────────────
  useEffect(() => {
    if (!takendjobdata?.data)  return;

    const row = takendjobdata.data;
    // Check if row actually exists and contains a valid job
    if (Array.isArray(row) && row.length === 0) return;
    if (typeof row === 'object' && Object.keys(row).length === 0) return;
    if (!row.jobCardId) return;

    if (hasNavigated.current)  return;  // ✅ skip if already navigated
    hasNavigated.current = true;

    if(!completed) {
      if (!row?.jobCardId || !row?.departmentid || !row?.processRouteId || !row?.Userid) {
        Alert.alert("Incomplete Data", "Taken job card data is missing required fields.");
        return;
      }
      navigation?.navigate("JOB", {
        id:          row?.jobCardId,
        dep:         row?.departmentid,
        processId:   row?.processRouteId,
        userId:      row?.Userid,
        machineId:   row?.Machineid,
        punch_data_: row,
      });
    }
  }, [takendjobdata]);

  // ── Taken job error ────────────────────────────────────────────────
  useEffect(() => {
    if (!isErrortaken) return;
    if (isExpectedRequestAbort(takencarderror)) return;

    logError(
      "HOME SCREEN", "API_CALL", "API",
      takencarderror,
      { message: "TAKEN JOB CARD FETCH FAILED" }
    );

    showModal({
      title:        'Previous Process',
      message:      "Previous process couldn't be fetched. Please select manually or retry.",
      type:         'warning',
      confirmLabel: 'Retry',
      cancelLabel:  'Cancel',
      onConfirm:    () => dispatch(JOBCARD_API.util.invalidateTags(["JobCard"])),
    });
  }, [isErrortaken, takencarderror, dispatch, showModal]);

  // ── Handlers ───────────────────────────────────────────────────────
  const handlePageChange = (newPage, newPerPage) => {
    setPage(newPage);
    setPerPage(newPerPage);
  };

  const handleDeptWarning = useCallback(() => {
    showWarning(
      'Department Required',
      'Please select your department before proceeding.',
    );
  }, []);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(localStatusUpdates).map(([id, status]) => {
        const job = jobs.find(j => String(j.id) === String(id));
        return {
          processId: job?.processId,
          status,
        };
      });
      
      for (const update of updates) {
        if (update.processId) {
          const res = await updateCurrentProcess(update).unwrap();
           if (Number(res?.statusCode) !== 1) {
            throw new Error(res?.message || "Failed to update process status");
           }
        }
      }
      
      setLocalStatusUpdates({});
      Alert.alert("Success", "All changes saved successfully!");
      onRefresh(); 
    } catch (err) {
      logError("HOME SCREEN", "UPDATE", "BATCH_UPDATE", err, { message: "Failed to save changes" });
      Alert.alert("Error", "Failed to save some changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const pendingColumns = [
    { key: 'process',      title: 'Process',       flex: 1, align: 'left' },
    ...(department?.toUpperCase() === 'PRINTING' ? [{
      key: 'machineDetails',
      title: 'MACHINE',
      flex: 1,
      minWidth: 100,
      render: (val) => {
        return <AppText numberOfLines={2} style={{ fontSize: typography?.sm?.fontSize ?? 14, color: c?.text }}>{val?.length > 0 ? val.map(m => m?.Mac?.name).filter(Boolean).join(', ') : "-"}</AppText>;
      },
      align: 'left'
    }] : []),
    { 
      key: 'currentState', 
      title: 'Status', 
      flex: 1,
      render: (val, row) => {
        if (editingRow?.id === row.id) {
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 120 }}>
              <View style={{ flex: 1 }}>
                <AppSearchableDropdown
                  containerStyle={{ marginBottom: 0 }}
                  triggerStyle={{ height: 36, paddingHorizontal: 8 }}
                  clearable={false}
                  options={[
                    { label: "In Process", value: "IN_PROGRESS" },
                    { label: "Completed", value: "COMPLETED" }
                  ]}
                  value={localStatusUpdates[row.id] || row.currentState}
                  onChange={option => {
                    if (option) {
                      setLocalStatusUpdates(prev => ({
                        ...prev,
                        [row.id]: option.value
                      }));
                    }
                    setEditingRow(null);
                  }}
                  placeholder="Status"
                />
              </View>
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); setEditingRow(null); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={18} color={c.error || 'red'} />
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppText style={{ fontSize: typography.sm?.fontSize ?? 14, color: c.text, flexShrink: 1 }}>{formatStatus(val)}</AppText>
            {userDetails?.username?.toLowerCase() === 'admin' && (
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); setEditingRow(row); }}>
                <Pencil size={16} color={c.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); setSelectedDetailsRow(row); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ExternalLink size={20} color={c.primary} />
            </TouchableOpacity>
          </View>
        );
      }
    }
  ];

  const completedColumns = [
    { key: 'process',      title: 'Process',       flex: 1, align: 'left' },
    ...(department?.toUpperCase() === 'PRINTING' ? [{
      key: 'machineDetails',
      title: 'MACHINE',
      flex: 1,
      minWidth: 100,
      render: (val) => (<AppText numberOfLines={2} style={{ fontSize: typography?.sm?.fontSize ?? 14, color: c?.text }}>{val?.length > 0 ? val.map(m => m?.Mac?.name).filter(Boolean).join(', ') : "-"}</AppText>),
      align: 'left'
    }] : []),
    { 
      key: 'currentState', 
      title: 'Status', 
      flex: 1,
      render: (val, row) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AppText style={{ fontSize: typography.sm?.fontSize ?? 14, color: c.text, flexShrink: 1 }}>{formatStatus(val)}</AppText>
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); setSelectedDetailsRow(row); }} hitSlop={{ top: 10, bottom: 10, left: 25, right: 10 }}>
            <ExternalLink size={20} color={c.primary} />
          </TouchableOpacity>
        </View>
      )
    }
  ];

  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, radius, typography, iconSize, Screens } = theme;
  const { wp, hp } = Screens;
  const styles = makeStyles(c, spacing, radius, typography);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >

        <Header
          setshowscanner={setShowQrcode}
          iconSize={iconSize}
          selected={selected}
          spacing={spacing}
          wp={wp}
          hp={hp}
          c={c}
        />

        {/* ── QR Scanner Modal ── */}
        <AppModal
          visible={showQrcode}
          onClose={() => setShowQrcode(false)}
          type="fullscreen"
          showHeader={false}
        >
          <QRScanner
            onScan={(data) => {
              try {
                
             const scandata = JSON?.parse(data)
             const row = jobs?.find((fdata)=>String(fdata.id) === String(scandata?.id))
             setShowQrcode(false);
             if(!row)  return Alert?.alert("No Job","Invalid job card QR!")
             
             if (!row?.id || !selected || !row?.processId || !userDetails?.id) {
               return Alert?.alert("Missing Data", "Incomplete job data. Please check department selection and try again.");
             }
             
             navigation?.navigate("JOB", {
            jobCardDocId: row?.jobCardId,
            id:           row?.id,
            dep:          selected,
            processId:    row?.processId,
            userId:       userDetails?.id,
            viewOnly:     true,  
             });

             
              } catch (error) {
                logError("HOME SCREEN", "QR_SCAN", "PARSE_ERROR", error, { rawData: data });
                Alert?.alert("Invalid QR Code", "The scanned QR code is not a valid Job Card format.");
              }
            }}
            onError={(err) => logError("HOME SCREEN", "QR_SCAN", "SCANNER_ERROR", err, { message: "QR Scanner component returned an error" })}

            onClose={() => setShowQrcode(false)}
            hint="Scan JobCard QR code"
            borderColor="#00FF00"
            scanInterval={2000}
          />
        </AppModal>

        {/* ── Details Modal ── */}
        <AppModal
          visible={!!selectedDetailsRow}
          onClose={() => setSelectedDetailsRow(null)}
          title="Job Card Details"
          type="center"
          size="medium"
        >
          {selectedDetailsRow && (
            <View style={{ padding: 10, gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: 8 }}>
                <AppText variant="sm" muted>Job Card ID:</AppText>
                <AppText style={{ color: c.text, fontWeight: '600' }}>{selectedDetailsRow.jobCardId}</AppText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: 8 }}>
                <AppText variant="sm" muted>Department:</AppText>
                <AppText style={{ color: c.text }}>{department || '-'}</AppText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: 8 }}>
                <AppText variant="sm" muted>Process:</AppText>
                <AppText style={{ color: c.text }}>{selectedDetailsRow.process}</AppText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: 8 }}>
                <AppText variant="sm" muted>Status:</AppText>
                <AppText style={{ color: c.text }}>{selectedDetailsRow.currentState}</AppText>
              </View>
              {selectedDetailsRow.priority && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: 8 }}>
                  <AppText variant="sm" muted>Priority:</AppText>
                  <AppText style={{ color: c.text }}>{selectedDetailsRow.priority}</AppText>
                </View>
              )}
              {selectedDetailsRow.machineDetails?.length > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: 8 }}>
                  <AppText variant="sm" muted>Machine Details:</AppText>
                  <AppText style={{ color: c.text, flex: 1, textAlign: 'right', marginLeft: 20 }}>
                    {selectedDetailsRow.machineDetails.map(m => m?.Mac?.name).filter(Boolean).join(', ')}
                  </AppText>
                </View>
              )}
            </View>
          )}
        </AppModal>

        <AppText variant="sm" muted align="center" style={{ marginTop: 20 }}>
          OR
        </AppText>

        <Body
          iconSize={iconSize}
          spacing={spacing}
          wp={wp}
          hp={hp}
          c={c}
          activeTab={activeTab}
         setActiveTab={setActiveTab}
          user={userDetails}
          navigation={navigation}
          onWarning={handleDeptWarning}
          dropdown={{
            selected,
            setSelected,
            options:   dep_options,
            isLoading: isLoadingDep,
            depName : department,
            setdepName : setdepartment
          }}
          table={{
            columns: pendingColumns,
            data:        jobs,
            isLoading:   isLoadingJobs,
            page,
            perPage,
            totalCount,
            onPageChange: handlePageChange,
            rowStyle: (row) => {
              if (row?.priority && String(row.priority).toUpperCase() === 'HIGH') {
                return { backgroundColor: '#e8f5e9' }; // Light green
              }
              return {};
            }
          }}

          completedtable = {{

             columns: completedColumns,
             data:        completed_jobs,
             isLoading:  isLoadingcompl_Jobs,
             page,
            perPage,
             totalCount : totalComp_Count,
             onPageChange: handlePageChange,
           
          }}
          localStatusUpdates={localStatusUpdates}
          onSaveChanges={handleSaveChanges}
          isSaving={isSaving}
        />

      </ScrollView>
    </View>
  );
};

const makeStyles = (c, spacing, radius, typography) =>
  StyleSheet.create({
    container: {
      flex:              1,
      backgroundColor:   c.background,
      paddingHorizontal: spacing.md,
    },
    content: {
      gap:               spacing.md,
      paddingHorizontal: spacing.xl,
    },
    statusBox: {
      borderColor:     c.border,
      borderRadius:    radius.md,
      borderWidth:     1.5,
      gap:             spacing.sm,
      padding:         spacing.md,
      backgroundColor: c.surface,
    },
  });
