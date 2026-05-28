import React, { useEffect, useState, memo, useContext, useCallback, useMemo, useRef } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ScanQrCode } from "lucide-react-native";
import useThemeProvider from "../../Theme/useThemeProvider";
import AppButton from "../../components/AppButton.jsx";
import AppText from "../../components/Text.jsx";
import AppSearchableDropdown from "../../components/AppSearchableDropdown.jsx";
import AppTable from "../../components/AppTable.jsx";
import { useDepartmentHooks } from "../../services/hooks/useDeparmentHooks.jsx";
import { useJobCardHooks } from "../../services/hooks/useJobCardHooks.jsx";
import QRScanner from "../../components/QRScanner.jsx";
import AppModal from "../../components/AppModal.jsx";
import { AuthContext } from "../../app/providers/AppProviders.jsx";
import { useDispatch } from "react-redux";
import JOBCARD_API, { useGetTakenJobcardQuery } from "../../redux/api/jobcard.js";
import { logError } from "../../Utils/crashLogger.js";
import { useAppModal } from "../../app/providers/AppModalProvider.jsx";


const Header = memo(({ setshowscanner, iconSize, spacing, wp, hp,selected, c }) => (
  <View style={{
    height:         hp(20),
    padding:        spacing.md,
    flexDirection:  "column",
    gap:            20,
    alignItems:     "center",
    justifyContent: "center",
  }}>
    <ScanQrCode
      size={iconSize.mxl}
      strokeWidth={1.5}
      color={c.text}
      style={{ marginTop: 10 }}
    />
    <AppButton
      style={{ width: wp(80) }}
      onPress={() =>{
       if(!selected) return Alert?.alert("Permission","Permission Denied Please Select Department!");
      setshowscanner(true)
      }}
      label="Scan Job Card"
    />
  </View>
));


const TABS = [
  { key: "pending",   label: "Pending"   },
  { key: "completed", label: "Completed" },
];

const Body = memo(({
  iconSize, spacing, wp, hp, c,
  dropdown, table, completedtable,
  navigation, user, onWarning,
  activeTab, setActiveTab,        
}) => (
  <View style={{
    height:        hp(80),
    padding:       spacing.md,
    flexDirection: "column",
    gap:           20,
    alignItems:    "center",
    justifyContent:"flex-start",
  }}>

    <AppSearchableDropdown
      widthPercent={80}
      disabled={dropdown?.isLoading}
      options={dropdown?.options}
      label="Select Department"
      value={dropdown?.selected}
      onChange={option => dropdown?.setSelected(option ? option.value : null)}
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
        onRowPress={row => {
          if (!dropdown?.selected) return onWarning();
          navigation?.navigate("JOB", {
            jobCardDocId: row?.jobCardId,
            id:           row?.id,
            dep:          dropdown?.selected,
            processId:    row?.processId,
            userId:       user?.id,
          });
        }}
      />
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
      return dept?.departmentId == department;
    })
    ?.map((job) => ({
      jobCardId:    job?.docId,
      currentState: job?.processRoute?.status,
      process:      job?.processRoute?.Process?.name,
      processId:    job?.processRoute?.id,
      id:           job?.id,
    }));


const convertCompletedJobCardData = (data, department) =>
  data
    ?.map(job => ({
      jobCardId:    job?.docId,
      currentState: "COMPLETED",
      process:    "COMPLETED"   ,
      processId:    job?.processRoute?.id,
      id:           job?.id,
    }));

export const HomeScreen = ({ navigation,route } = {}) => {
  const {completed} = route?.params ?? {};
  const { showModal, showWarning } = useAppModal();
  const { userDetails }            = useContext(AuthContext);
  const dispatch                   = useDispatch();
  const [activeTab, setActiveTab] = useState("pending");

  const [selected,   setSelected]   = useState(null);
  const [showQrcode, setShowQrcode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page,       setPage]       = useState(1);
  const [perPage,    setPerPage]    = useState(10);

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

  const {  data:      compl_jobCardData,
    isLoading: isLoadingcompl_Jobs,
    refetch:   refreshcompl_jobcard,}=getJobCardCompletedList

  const {
    data:    takendjobdata,
    isLoading: loadingTakendata,
    isError: isErrortaken,
    error:   takencarderror,
  } = useGetTakenJobcardQuery({ userid: userDetails?.id ?? null },{skip:completed && !userDetails?.id });

  // ── Derived ────────────────────────────────────────────────────────
  const dep_options = convertDepartmentData(deptData?.data);

  // ✅ fixed — both jobCardData and selected in deps
  const jobs = useMemo(
    () => convertJobCardData(jobCardData?.data, selected) ?? [],
    [jobCardData, selected],
  );

  const completed_jobs = useMemo(
    () => convertCompletedJobCardData(compl_jobCardData?.data, selected) ?? [],
    [compl_jobCardData, selected],
  );

  const totalCount = jobCardData?.totalCount ?? 0;

  const totalComp_Count = compl_jobCardData?.totalCount ?? 0 ;

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
      logError("HOME SCREEN", "REFRESH", "PULL_REFRESH", "Refresh Failed", err);
    } finally {
      setRefreshing(false);         // ✅ always stop spinner even on error
    }
  }, []);

  // ── Taken job navigation ───────────────────────────────────────────
  useEffect(() => {
    if (!takendjobdata?.data)  return;
    if (hasNavigated.current)  return;  // ✅ skip if already navigated

    hasNavigated.current = true;

    const row = takendjobdata?.data;
    if(!completed)
    navigation?.navigate("JOB", {
      id:          row?.jobCardId,
      dep:         row?.departmentid,
      processId:   row?.processRouteId,
      userId:      row?.Userid,
      machineId:   row?.Machineid,
      punch_data_: takendjobdata?.data,
    });
  }, [takendjobdata]);

  // ── Taken job error ────────────────────────────────────────────────
  useEffect(() => {
    if (!isErrortaken) return;

    logError(
      "HOME SCREEN", "API_CALL", "API",
      "TAKEN JOB CARD FETCH FAILED",
      typeof takencarderror === "object" ? takencarderror : { takencarderror },
    );

    showModal({
      title:        'Previous Process',
      message:      "Previous process couldn't be fetched. Please select manually or retry.",
      type:         'warning',
      confirmLabel: 'Retry',
      cancelLabel:  'Cancel',
      onConfirm:    () => dispatch(JOBCARD_API.util.invalidateTags(["JobCard"])),
    });
  }, [isErrortaken]);

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

  const columns = [
    { key: 'jobCardId',    title: 'Job Card ID',   flex: 1.1 },
    { key: 'currentState', title: 'Current State', flex: 1 },
    { key: 'process',      title: 'Process',       flex: 1, align: 'center' },
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
             const scandata = JSON?.parse(data)
             const row = jobs?.find((fdata)=>fdata.id == scandata?.id)
            setShowQrcode(false);
             navigation?.navigate("JOB", {
            jobCardDocId: row?.jobCardId,
            id:           row?.id,
            dep:          selected,
            processId:    row?.processId,
            userId:       userDetails?.id,
            viewOnly:     true,  
             });
            }}
            onError={(err) => console.error(err)}

            onClose={() => setShowQrcode(false)}
            hint="Scan JobCard QR code"
            borderColor="#00FF00"
            scanInterval={2000}
          />
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
          }}
          table={{
            columns,
            data:        jobs,
            isLoading:   isLoadingJobs,
            page,
            perPage,
            totalCount,
            onPageChange: handlePageChange,
          }}

          completedtable = {{

             columns,
             data:        completed_jobs,
             isLoading:  isLoadingcompl_Jobs,
             page,
            perPage,
             totalCount : totalComp_Count,
             onPageChange: handlePageChange,
           
          }}
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