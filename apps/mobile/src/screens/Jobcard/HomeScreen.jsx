import React, {
  useEffect,
  useState,
  memo,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
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
import JOBCARD_API, {
  useGetTakenJobcardQuery,
} from "../../redux/api/jobcard.js";
import { useUpdateCurrentProcessMutation } from "../../redux/api/process.js";
import { logError } from "../../Utils/crashLogger.js";
import { useAppModal } from "../../app/providers/AppModalProvider.jsx";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useInterval } from "../../services/hooks/useInterval.jsx";
import { isWithinWindow } from "../../Utils/isWithinWindow.js";
import {
  useLazyGetNotificationMachinesQuery,
  useMarkMachineViewedMutation,
} from "../../redux/api/machine.js";
import { allowedNotifiOfficer } from "../../constant/notificationOfficers.js";

const Header = memo(
  ({ setshowscanner, onRefresh, iconSize, spacing, wp, hp, selected, c }) => (
    <View
      style={{
        height: hp(20),
        padding: spacing.md,
        flexDirection: "column",
        gap: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.md,
      }}
    >
      <MaterialIcons
        name="qr-code-scanner"
        size={iconSize.mxl}
        color={c.text}
        style={{ marginTop: 10 }}
      />
      <AppButton
        style={{ width: wp(90) }}
        onPress={() => {
          onRefresh?.();
          setshowscanner(true);
        }}
        label="Scan Job Card"
      />
    </View>
  ),
);

const TABS = [
  { key: "pending", label: "Available" },
  { key: "completed", label: "Completed" },
];

const Body = memo(
  ({
    iconSize,
    spacing,
    wp,
    hp,
    c,
    dropdown,
    table,
    completedtable,
    navigation,
    user,
    onWarning,
    activeTab,
    setActiveTab,
    localStatusUpdates,
    onSaveChanges,
    isSaving,
    scannedJobCardFilter,
    setScannedJobCardFilter,
  }) => (
    <View
      style={{
        minHeight: hp(80),
        padding: spacing.md,
        flexDirection: "column",
        gap: 20,
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <AppSearchableDropdown
        widthPercent={90}
        disabled={dropdown?.isLoading}
        options={dropdown?.options}
        label="Select Department *"
        value={dropdown?.selected}
        onChange={(option) => {
          dropdown?.setSelected(option ? option.value : null);
          dropdown?.setdepName(option ? option.label : null);
        }}
        placeholder="Select Department"
        clearable
      />

      {/* ── Tab Toggle ── */}
      {dropdown?.selected && (
        <View
          style={{
            flexDirection: "row",
            width: wp(90),
            borderRadius: 8,
            borderWidth: 1,
            borderColor: c.border,
            overflow: "hidden",
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: "center",
                  backgroundColor: isActive ? c.primary : c.surface,
                }}
              >
                <AppText
                  variant="sm"
                  style={{
                    color: isActive ? c.background : c.text,
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {tab.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Clear Filter Banner ── */}
      {scannedJobCardFilter && dropdown?.selected && (
        <View
          style={{
            flexDirection: "row",
            width: wp(90),
            backgroundColor: c.primary + "15",
            padding: 10,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "space-between",
            borderColor: c.primary,
            borderWidth: 1,
          }}
        >
          <AppText style={{ color: c.text, flex: 1, fontWeight: "600" }}>
            Filtered by JobCard: {scannedJobCardFilter}
          </AppText>
          <TouchableOpacity
            onPress={() => setScannedJobCardFilter(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color={c.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Conditional Table ── */}
      {!dropdown?.selected ? (
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <AppText
            variant="md"
            style={{
              color: c.text,
              fontWeight: "500",
              textAlign: "center",
              opacity: 0.7,
            }}
          >
           {scannedJobCardFilter ?  `Jobcard ${scannedJobCardFilter} scanned. Please select a department to continue`  : "Department selection is required"} 
          </AppText>
        </View>
      ) : activeTab === "pending" ? (
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
            onRowPress={(row) => {
              if (!dropdown?.selected) return onWarning();

              if (
                dropdown?.depName?.toUpperCase() === "PRINTING" &&
                (!row?.machineDetails || row?.machineDetails?.length === 0)
              ) {
                return Alert.alert(
                  "Warning",
                  "This process is not currently mapped to the assigned machine(s). Please contact your supervisor or the concerned officer for further assistance",
                );
              }

              const highPriorityJob = table?.data?.find(
                (j) =>
                  j?.priority && String(j.priority).toUpperCase() === "HIGH",
              );
              const isCurrentHighPriority =
                row?.priority && String(row.priority).toUpperCase() === "HIGH";

              const proceed = () => {
                if (
                  !row?.id ||
                  !dropdown?.selected ||
                  !row?.processId ||
                  !user?.id
                ) {
                  return Alert.alert(
                    "Missing Data",
                    "Required job card data is incomplete. Please try again.",
                  );
                }
                navigation?.navigate("JOB", {
                  jobCardDocId: row?.jobCardId,
                  id: row?.id,
                  dep: dropdown?.selected,
                  depName: dropdown?.depName,
                  processId: row?.processId,
                  userId: user?.id,
                  machineDetails: row?.machineDetails,
                });
              };

              if (highPriorityJob && !isCurrentHighPriority) {
                Alert.alert(
                  "High Priority Job",
                  `Job ${highPriorityJob.jobCardId} is high priority. Please select Job ${highPriorityJob.jobCardId}`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "OK", onPress: proceed },
                  ],
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
          onRowPress={(row) => {
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
  ),
);

const convertDepartmentData = (data) => {
  if (!data) return [];
  return data
    .map((dep) => ({ label: dep?.name, value: dep?.id }))
    .sort((a, b) => (a.label || "").localeCompare(b.label || ""));
};

const convertJobCardData = (data, department, scannedJobCardFilter) =>
  data
    ?.filter((fdata) => {
      const dept = fdata?.processRoute?.Process;
      if (scannedJobCardFilter && department)
        return (
          String(fdata?.docId) === String(scannedJobCardFilter) &&
          String(dept?.departmentId) === String(department)
        );
      if (scannedJobCardFilter)
        return String(fdata?.docId) === String(scannedJobCardFilter);
      if (!department) return true;
      return String(dept?.departmentId) === String(department);
    })
    ?.map((job) => ({
      jobCardId: job?.docId,
      currentState: job?.processRoute?.status,
      process: job?.processRoute?.Process?.name,
      processId: job?.processRoute?.id,
      id: job?.id,
      priority: job?.priority,
      machineDetails: job?.machineDetails,
    }));

const convertCompletedJobCardData = (data) =>
  data?.map((job) => ({
    jobCardId: job?.docId,
    currentState: "COMPLETED",
    process: "COMPLETED",
    processId: job?.processRoute?.id,
    id: job?.id,
    machineDetails: job?.machineDetails,
  }));

const formatStatus = (status) => {
  if (!status) return "-";
  const str = String(status).toUpperCase();
  switch (str) {
    case "IN_PROGRESS":
      return "IN_PROG";
    case "NOT_STARTED":
      return "NOT_STD";
    case "COMPLETED":
      return "COMPL";
    case "PARTIALLY_COMPLETED":
      return "IN_PROG";
    default:
      return str;
  }
};

const isExpectedRequestAbort = (error) =>
  error?.status === "FETCH_ERROR" && /abort/i.test(String(error?.error ?? ""));

export const HomeScreen = ({ navigation, route } = {}) => {
  const { completed } = route?.params ?? {};
  const { showModal, showWarning } = useAppModal();
  const { userDetails } = useContext(AuthContext);
  const [isRunning, setIsRunning] = useState(true);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("pending");

  const [selected, setSelected] = useState(null);
  const [department, setdepartment] = useState("");
  const [showQrcode, setShowQrcode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [localStatusUpdates, setLocalStatusUpdates] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [scannedJobCardFilter, setScannedJobCardFilter] = useState(null);
  const [selectedDetailsRow, setSelectedDetailsRow] = useState(null);

  // ✅ prevents re-navigation after refresh
  const hasNavigated = useRef(false);

  // ── Queries ────────────────────────────────────────────────────────
  const { getDepartments } = useDepartmentHooks();
  const {
    data: deptData,
    isLoading: isLoadingDep,
    refetch: refreshdepartment,
  } = getDepartments;

  const { getJobCardList, getJobCardCompletedList } = useJobCardHooks({
    getJobCardList_params: {
      pagination: true,
      pageNumber: page,
      dataPerPage: perPage,
    },
  });

  const {
    data: jobCardData,
    isLoading: isLoadingJobs,
    refetch: refreshjobcard,
  } = getJobCardList;

  const [updateCurrentProcess] = useUpdateCurrentProcessMutation();

  const {
    data: compl_jobCardData,
    isLoading: isLoadingcompl_Jobs,
    refetch: refreshcompl_jobcard,
  } = getJobCardCompletedList;

  const {
    data: takendjobdata,
    isLoading: loadingTakendata,
    isError: isErrortaken,
    error: takencarderror,
  } = useGetTakenJobcardQuery(
    { userid: userDetails?.id ?? null },
    { skip: completed || !userDetails?.id },
  );

  // ── Derived ────────────────────────────────────────────────────────
  const dep_options = convertDepartmentData(deptData?.data);

  // ✅ fixed — both jobCardData and selected in deps
  const jobs = useMemo(() => {
    let baseJobs =
      convertJobCardData(jobCardData?.data, selected, scannedJobCardFilter) ??
      [];

    if (scannedJobCardFilter) {
      baseJobs = baseJobs.filter(
        (job) => String(job.jobCardId) === String(scannedJobCardFilter),
      );
    }

    baseJobs.sort((a, b) => {
      const isAHigh =
        a?.priority && String(a.priority).toUpperCase() === "HIGH";
      const isBHigh =
        b?.priority && String(b.priority).toUpperCase() === "HIGH";
      if (isAHigh && !isBHigh) return -1;
      if (!isAHigh && isBHigh) return 1;
      return 0;
    });

    return baseJobs.map((job) => ({
      ...job,
      currentState: localStatusUpdates[job.id] || job.currentState,
    }));
  }, [jobCardData, selected, localStatusUpdates, scannedJobCardFilter]);

  const completed_jobs = useMemo(() => {
    let baseComp =
      convertCompletedJobCardData(compl_jobCardData?.data, selected) ?? [];
    if (scannedJobCardFilter) {
      baseComp = baseComp.filter(
        (job) => String(job.jobCardId) === String(scannedJobCardFilter),
      );
    }
    return baseComp;
  }, [compl_jobCardData, selected, scannedJobCardFilter]);

  const totalCount = jobs?.length ?? 0;

  const totalComp_Count = completed_jobs?.length ?? 0;

  // ── Refresh ────────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    hasNavigated.current = false; // ✅ reset guard so taken job re-checked

    try {
      await dispatch(JOBCARD_API.util.invalidateTags(["JobCard"]));
      await refreshdepartment();
      await refreshjobcard(); // ✅ was missing
      await refreshcompl_jobcard();
    } catch (err) {
      logError("HOME SCREEN", "REFRESH", "PULL_REFRESH", err, {
        message: "Refresh Failed",
      });
    } finally {
      setRefreshing(false); // ✅ always stop spinner even on error
    }
  }, []);

  // ── Taken job navigation ───────────────────────────────────────────
  // useEffect(() => {
  //   if (!takendjobdata?.data) return;

  //   const row = takendjobdata.data;
  //   // Check if row actually exists and contains a valid job
  //   if (Array.isArray(row) && row.length === 0) return;
  //   if (typeof row === "object" && Object.keys(row).length === 0) return;
  //   if (!row.jobCardId) return;

  //   if (hasNavigated.current) return; // ✅ skip if already navigated
  //   hasNavigated.current = true;

  //   if (!completed) {
  //     if (
  //       !row?.jobCardId ||
  //       !row?.departmentid ||
  //       !row?.processRouteId ||
  //       !row?.Userid
  //     ) {
  //       Alert.alert(
  //         "Incomplete Data",
  //         "Taken job card data is missing required fields.",
  //       );
  //       return;
  //     }
  //     navigation?.navigate("JOB", {
  //       id: row?.jobCardId,
  //       dep: row?.departmentid,
  //       processId: row?.processRouteId,
  //       userId: row?.Userid,
  //       machine_Id: row?.Machineid,
  //       punch_datas: row,
  //     });
  //   }
  // }, [takendjobdata]);

  const [triggerGetNotificationMachines] =
    useLazyGetNotificationMachinesQuery();
  const [markMachineViewed] = useMarkMachineViewedMutation();
 

  useInterval(
    () => {

        if (isWithinWindow(17, 24)  && allowedNotifiOfficer?.includes(userDetails?.roleGroup)) {

        triggerGetNotificationMachines()
          .unwrap()
          .then((res) => {
            const machines = res?.data || [];
            if (machines.length > 0) {
              const message = machines
                .map(
                  (m) =>
                    `•  ${m.machineName} (${m.process}) This Machine Is Running - ${m.runningDuration}\n  Used By : ${m.user} | JobCard: ${m.jobCard}`,
                )
                .join("\n\n");

              Alert.alert("Machines Running Alert", message, [
                {
                  text: "OK",
                  onPress: () => {
                    machines.forEach((machine) => {
                      if (machine.machineId) {
                        markMachineViewed({
                           machineId: machine.machineId,
                           userId:userDetails?.id
                          }).catch((err) =>
                          console.log("Failed to mark viewed", err),
                        );
                        setIsRunning(false)
                      }
                    });
                  },
                },
              ]);
            }
          })
          .catch((err) => console.log("Error fetching notifications", err));
        }
     
      if(!userDetails?.roleGroup && !isWithinWindow(17, 24) || allowedNotifiOfficer?.includes(userDetails?.roleGroup) === false){
        setIsRunning(false)
      }
    },
    isRunning ? 60 * 1000 : null,
  );

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener("focus", () => {
      onRefresh();
    });

    return unsubscribeFocus;
  }, [navigation]);

  // ── Taken job error ────────────────────────────────────────────────
  useEffect(() => {
    if (!isErrortaken) return;
    if (isExpectedRequestAbort(takencarderror)) return;

    logError("HOME SCREEN", "API_CALL", "API", takencarderror, {
      message: "TAKEN JOB CARD FETCH FAILED",
    });

    showModal({
      title: "JobCard Process",
      message: "process couldn't be fetched. Please select manually or retry.",
      type: "warning",
      confirmLabel: "Retry",
      cancelLabel: "Cancel",
      onConfirm: () => dispatch(JOBCARD_API.util.invalidateTags(["JobCard"])),
    });
  }, [isErrortaken, takencarderror, dispatch, showModal]);

  // ── Handlers ───────────────────────────────────────────────────────
  const handlePageChange = (newPage, newPerPage) => {
    setPage(newPage);
    setPerPage(newPerPage);
  };

  const handleDeptWarning = useCallback(() => {
    showWarning(
      "Department Required",
      "Please select your department before proceeding.",
    );
  }, []);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(localStatusUpdates).map(([id, status]) => {
        const job = jobs.find((j) => String(j.id) === String(id));
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
      logError("HOME SCREEN", "UPDATE", "BATCH_UPDATE", err, {
        message: "Failed to save changes",
      });
      Alert.alert("Error", "Failed to save some changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const pendingColumns = [
    { key: "process", title: "Process", flex: 1, align: "left" },
    ...(department?.toUpperCase() === "PRINTING"
      ? [
          {
            key: "machineDetails",
            title: "MACHINE",
            flex: 1,
            minWidth: 100,
            render: (val) => {
              return (
                <AppText
                  numberOfLines={2}
                  style={{
                    fontSize: typography?.sm?.fontSize ?? 14,
                    color: c?.text,
                  }}
                >
                  {val?.length > 0
                    ? val
                        .map((m) => m?.name)
                        .filter(Boolean)
                        .join(", ")
                    : "-"}
                </AppText>
              );
            },
            align: "left",
          },
        ]
      : []),
    {
      key: "currentState",
      title: "Status",
      flex: 1,
      align: "center",
      render: (val, row) => {
        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-evenly",
              flex: 1,
              alignSelf: "stretch",
            }}
          >
            <AppText
              style={{
                fontSize: typography.sm?.fontSize ?? 14,
                color: c.text,
                flexShrink: 1,
              }}
            >
              {formatStatus(val)}
            </AppText>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setSelectedDetailsRow(row);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ExternalLink size={20} color={c.primary} />
            </TouchableOpacity>
          </View>
        );
      },
    },
  ];

  const completedColumns = [
    { key: "process", title: "Process", flex: 1, align: "left" },
    ...(department?.toUpperCase() === "PRINTING"
      ? [
          {
            key: "machineDetails",
            title: "MACHINE",
            flex: 1,
            minWidth: 100,
            render: (val) => (
              <AppText
                numberOfLines={2}
                style={{
                  fontSize: typography?.sm?.fontSize ?? 14,
                  color: c?.text,
                }}
              >
                {val?.length > 0
                  ? val
                      .map((m) => m?.name)
                      .filter(Boolean)
                      .join(", ")
                  : "-"}
              </AppText>
            ),
            align: "left",
          },
        ]
      : []),
    {
      key: "currentState",
      title: "Status",
      flex: 1,
      align: "center",
      render: (val, row) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
            flex: 1,
            alignSelf: "stretch",
          }}
        >
          <AppText
            style={{
              fontSize: typography.sm?.fontSize ?? 14,
              color: c.text,
              flexShrink: 1,
            }}
          >
            {formatStatus(val)}
          </AppText>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setSelectedDetailsRow(row);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 25, right: 10 }}
          >
            <ExternalLink size={20} color={c.primary} />
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, radius, typography, iconSize, Screens } = theme;
  const { wp, hp } = Screens;
  const styles = makeStyles(c, spacing, radius, typography);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Header
          setshowscanner={setShowQrcode}
          iconSize={iconSize}
          selected={selected}
          spacing={spacing}
          wp={wp}
          onRefresh={onRefresh}
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
                const scandata = JSON?.parse(data);
                const row = jobs?.find(
                  (fdata) => String(fdata.id) === String(scandata?.id),
                );
                setShowQrcode(false);
                if (!row)
                  return showWarning(
                    "No Job",
                    "Job card is invalid. Please scan a valid job card or select department to contiue.",
                  );

                if (!row?.id || !row?.processId || !userDetails?.id) {
                  return showWarning(
                    "Missing Data",
                    "Incomplete job data. Please check department selection and try again.",
                  );
                }

                setScannedJobCardFilter(row?.jobCardId);
                setActiveTab("pending");
              } catch (error) {
                logError("HOME SCREEN", "QR_SCAN", "PARSE_ERROR", error, {
                  rawData: data,
                });

                showWarning(
                  "Invalid QR Code",
                  "The scanned QR code is not a valid Job Card format.",
                );
              }
            }}
            onError={(err) =>
              logError("HOME SCREEN", "QR_SCAN", "SCANNER_ERROR", err, {
                message: "QR Scanner component returned an error",
              })
            }
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
              <View
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: c.border,
                  paddingBottom: 8,
                }}
              >
                <AppText variant="sm" muted style={{ width: 130 }}>
                  Job Card ID:
                </AppText>
                <AppText
                  style={{
                    color: c.text,
                    fontWeight: "600",
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  {selectedDetailsRow.jobCardId}
                </AppText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: c.border,
                  paddingBottom: 8,
                }}
              >
                <AppText variant="sm" muted style={{ width: 130 }}>
                  Department:
                </AppText>
                <AppText style={{ color: c.text, flex: 1, textAlign: "left" }}>
                  {department || "-"}
                </AppText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: c.border,
                  paddingBottom: 8,
                }}
              >
                <AppText variant="sm" muted style={{ width: 130 }}>
                  Process:
                </AppText>
                <AppText style={{ color: c.text, flex: 1, textAlign: "left" }}>
                  {selectedDetailsRow.process}
                </AppText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: c.border,
                  paddingBottom: 8,
                }}
              >
                <AppText variant="sm" muted style={{ width: 130 }}>
                  Status:
                </AppText>
                <AppText style={{ color: c.text, flex: 1, textAlign: "left" }}>
                  {selectedDetailsRow.currentState}
                </AppText>
              </View>
              {selectedDetailsRow.priority && (
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: c.border,
                    paddingBottom: 8,
                  }}
                >
                  <AppText variant="sm" muted style={{ width: 130 }}>
                    Priority:
                  </AppText>
                  <AppText
                    style={{ color: c.text, flex: 1, textAlign: "left" }}
                  >
                    {selectedDetailsRow.priority}
                  </AppText>
                </View>
              )}
              {selectedDetailsRow.machineDetails?.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: c.border,
                    paddingBottom: 8,
                  }}
                >
                  <AppText variant="sm" muted style={{ width: 130 }}>
                    Machine Details:
                  </AppText>
                  <AppText
                    style={{ color: c.text, flex: 1, textAlign: "left" }}
                  >
                    {selectedDetailsRow.machineDetails
                      .map((m) => m?.name)
                      .filter(Boolean)
                      .join(", ")}
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
            options: dep_options,
            isLoading: isLoadingDep,
            depName: department,
            setdepName: setdepartment,
          }}
          table={{
            columns: pendingColumns,
            data: jobs,
            isLoading: isLoadingJobs,
            page,
            perPage,
            totalCount,
            onPageChange: handlePageChange,
            rowStyle: (row) => {
              if (
                row?.priority &&
                String(row.priority).toUpperCase() === "HIGH"
              ) {
                return { backgroundColor: "#e8f5e9" }; // Light green
              }
              return {};
            },
          }}
          completedtable={{
            columns: completedColumns,
            data: completed_jobs,
            isLoading: isLoadingcompl_Jobs,
            page,
            perPage,
            totalCount: totalComp_Count,
            onPageChange: handlePageChange,
          }}
          localStatusUpdates={localStatusUpdates}
          onSaveChanges={handleSaveChanges}
          isSaving={isSaving}
          scannedJobCardFilter={scannedJobCardFilter}
          setScannedJobCardFilter={setScannedJobCardFilter}
        />
      </ScrollView>
    </View>
  );
};

const makeStyles = (c, spacing, radius, typography) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      paddingHorizontal: spacing.md,
    },
    content: {
      gap: spacing.md,
      paddingHorizontal: spacing.xl,
    },
    statusBox: {
      borderColor: c.border,
      borderRadius: radius.md,
      borderWidth: 1.5,
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: c.surface,
    },
  });
