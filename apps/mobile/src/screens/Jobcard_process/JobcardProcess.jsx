import React, { useEffect, useMemo, useState, useCallback } from "react";

import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import {
  ChevronLeft,
  CheckCircle,
  Circle,
  ArrowRight,
  AlertCircle,
} from "lucide-react-native";
import useThemeProvider from "../../Theme/useThemeProvider.jsx";
import AppText from "../../components/Text.jsx";
import AppSearchableDropdown from "../../components/AppSearchableDropdown.jsx";
import AppButton from "../../components/AppButton.jsx";
import JOBCARD_API, {
  useGetAvailableDepmachinesQuery,
  useGetJobCardQuery,
} from "../../redux/api/jobcard.js";
import {
  useUpdateProcessMutation,
  useUpdatePushProcessMutation,
} from "../../redux/api/process.js";
import { logError } from "../../Utils/crashLogger.js";
import { useDispatch } from "react-redux";
import { useAppModal } from "../../app/providers/AppModalProvider.jsx";
import AppInput from "../../components/AppInput.jsx";
import AppModal from "../../components/AppModal.jsx";
import { storage } from "../../Utils/Storage/mmkv.js";

const ProcessRouteTimeline = ({
  allProcessRoutes = [],
  currentRoute,
  c,
  spacing,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 4,
      }}
    >
      {allProcessRoutes.map((route, index) => {
        const isCompleted = route?.status === "COMPLETED";
        const isCurrent = route?.id === currentRoute?.id;
        const isLast = index === allProcessRoutes.length - 1;

        return (
          <View
            key={route?.id}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            {/* Process name */}
            <AppText
              variant="sm"
              style={{
                color: isCompleted
                  ? c.btnprimary
                  : isCurrent
                    ? c.text
                    : c.textMuted,
                fontWeight: isCurrent ? "700" : isCompleted ? "600" : "400",
              }}
            >
              {route?.Process?.name ?? `Step ${index + 1}`}
            </AppText>

            {/* Arrow */}
            {!isLast && (
              <ArrowRight
                size={12}
                color={isCompleted ? c.primary : c.textMuted}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const InfoRow = ({ label, children, c, spacing, styles }) => (
  <View style={styles.infoRow}>
    <AppText
      variant="sm"
      style={{ color: c.textMuted, fontWeight: "600", flex: 0.45 }}
    >
      {label}
    </AppText>
    <View style={{ flex: 0.55 }}>{children}</View>
  </View>
);

const ActionButton = ({ label, onPress, disabled, color, c, styles }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.actionBtn,
      {
        borderColor: disabled ? c.border : color,
        opacity: disabled ? 0.4 : 1,
      },
    ]}
  >
    <AppText
      style={{
        color: disabled ? c.textMuted : color,
        fontWeight: "700",
        fontSize: 18,
      }}
    >
      {label}
    </AppText>
  </TouchableOpacity>
);

function JobCardProcess({ navigation, route }) {
  const { jobCardDocId, id, dep, processId, machine_id, userId, punch_datas } =
    route?.params ?? {};
  const dispatch = useDispatch();
  const [punchId, setpunchId] = useState(null);
  const [pauseable, setpauseable] = useState(false);
  const [resumable, setresumable] = useState(false);
  const [lockmachine, setlockmachine] = useState(false);
  const [appModalOpen_sqty, setappModalOpen_sqty] = useState(false);
  const [completedqty, setcompletedqty] = useState("");
  const [wastageQty, setwastageQty] = useState("");
  const [remarks, setRemarks] = useState("");
  const [qtyerror, setqtyerror] = useState("");
  const [splitQty, setSplitQty] = useState({});
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [pauseQty, setPauseQty] = useState("");
  const [pauseRemarks, setPauseRemarks] = useState("");

  const PAUSE_REASONS = useMemo(
    () => [
      { label: "Tea Break (Morning)", value: "Tea Break (Morning)" },
      { label: "Tea Break (Evening)", value: "Tea Break (Evening)" },
      { label: "Lunch", value: "Lunch" },
      { label: "Partially Completed", value: "Partially Completed" },
      { label: "Others", value: "Others" },
    ],
    [],
  );

  const mmkvKey = `split_qty_${id}_${processId}`;

  useEffect(() => {
    if (id && processId) {
      const saved = storage.getString(mmkvKey);
      if (saved) {
        try {
          setSplitQty(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse splitQty from mmkv", e);
        }
      }
    }
  }, [id, processId]);

  useEffect(() => {
    if (id && processId) {
      if (Object.keys(splitQty).length > 0) {
        storage.set(mmkvKey, JSON.stringify(splitQty));
      }
    }
  }, [splitQty, id, processId]);

  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, radius, typography, iconSize, Screens, borderWidth } = theme;
  const { wp, hp } = Screens;
  const styles = makeStyles(c, spacing, radius);
  const [refreshing, setRefreshing] = useState(false);

  const { showModal } = useAppModal();

  const {
    data: jobcardRes,
    refetch: refreshjobcard,
    isLoading,
    isError: iserrorgetJobcard,
    error: errorjobcard,
  } = useGetJobCardQuery(
    { id, userid: userId, processRouteId: processId },
    { skip: !id },
  );



  const jobcard = jobcardRes?.data;
  var punch_data = punch_datas ?? jobcardRes?.data?.punch_data;
  var machineId = machine_id ?? jobcardRes?.data?.punch_data?.Machineid;
  var machineEndCheck = machine_id ?? jobcardRes?.data?.punch_data?.endDate;
  const isLabel = jobcardRes?.data?.itemType === "LABEL";
  const isnotLabel = jobcardRes?.data?.itemType !== "LABEL";

  useEffect(() => {
    if (!id || !processId || !dep || !userId) {
      Alert.alert(
        "Invalid Data",
        "Required job card information is missing. Please try again.",
      );
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("HOME");
      }
    }
  }, [id, processId, dep, userId, navigation]);
  const {
    data: departmentmachine_data,
    isLoading: deparmentloading,
    error,
  } = useGetAvailableDepmachinesQuery(
    { departmentId: dep, machineId: machineId },
    { skip: !dep },
  );

  const [updateprocess, { data: update_data, isLoading: updateloading }] =
    useUpdateProcessMutation({});

  const [
    update_pause_process,
    { data: update_pause_data, isLoading: update_pause_loading },
  ] = useUpdatePushProcessMutation({});

  const allProcessRoutes = jobcard?.allProcessRoutes ?? [];
  const currentRoute =
    allProcessRoutes.find((r) => String(r.id) === String(processId)) ||
    jobcard?.processRoute;
  const isCutAndSeal =
    currentRoute?.Process?.name?.toLowerCase()?.includes("cut & seal") ?? false;

  const sq = currentRoute?.sequence ? Number(currentRoute.sequence) - 1 : null;
  const processqty = useMemo(() => {
    if (
      currentRoute?.status === "PARTIALLY_COMPLETED" &&
      currentRoute?.pendingQty > 0
    ) {
      return currentRoute.pendingQty;
    }

    if (isLabel) return jobcard?.rollQty;

    return Number(currentRoute?.sequence) === 1 &&
      currentRoute?.status === "NOT_STARTED"
      ? jobcard?.runningQty
      : (currentRoute?.processIncomingQty ?? jobcard?.processIncomingQty);
  }, [jobcard, currentRoute, allProcessRoutes, sq, isLabel]);

  const allocationDtls = currentRoute?.productionAllocationDtls ?? [];
  const firstAllocation = allocationDtls?.[0];
  const canStart = firstAllocation?.isInHouse === true;
  const isProcessStarted =
    pauseable ||
    resumable ||
    !!punchId ||
    (!!punch_data?.id && !punch_data?.endTime);

  // Removed automatic wastage calculation to allow manual entry

  const machineOptions = useMemo(
    () =>
      departmentmachine_data?.data?.machines?.map((m) => ({
        label: m?.name,
        value: m?.id,
        busy: m?.busy,
        useby: m?.busy_by?.username + " - " + m?.JobCard?.docId,
      })) ?? [],

    [departmentmachine_data],
    // [jobcard, dep],
  );

  const [selectedMachine, setSelectedMachine] = React.useState(null);

  useEffect(() => {
    if (iserrorgetJobcard && !isLoading) {
      const errMsg =
        errorjobcard?.data?.message ??
        errorjobcard?.message ??
        "Failed to load job card. Please try again.";

      const readableMessage =
        typeof errMsg === "string"
          ? errMsg
          : "Failed to load job card. Please try again.";
      logError(
        "Job Card Process",
        "LoadJobCardError",
        "API_ERROR",
        errorjobcard,
        { message: errMsg },
      );

      showModal({
        title: "Job Card Error",
        message: readableMessage,
        type: "error",
        confirmLabel: "Go Back",
        onConfirm: () => navigation.navigate("HOME"),
      });
    }
  }, [iserrorgetJobcard, isLoading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshjobcard();
      dispatch(JOBCARD_API.util.invalidateTags(["JobCard"]));
    } catch (err) {
      logError("Job Card Process", "onRefresh", "REFRESH", err, {
        message: "Refresh Failed",
      });
    } finally {
      setRefreshing(false);
    }
  }, [refreshjobcard]);

  async function startProcess() {
    try {
      var updatep = await updateprocess({
        status: "IN_PROGRESS",
        jobcardId: id,
        processId: processId,
        flag: "START",
        departmentId: dep,
        machineId: selectedMachine,
        userId: userId,
        id: 0,
      })?.unwrap();

      if (Number(updatep?.statusCode) === 1) {
        logError(
          "Job Card Process",
          "startProcess",
          "START_ERROR",
          updatep?.message,
          { response: updatep },
        );
        return Alert?.alert(
          "Failed to Start",
          updatep?.message ||
            "Unable to start the process. Please check details or try again.",
        );
      }

      setpauseable(true);
      // refreshjobcard()
      dispatch(JOBCARD_API.util.invalidateTags(["JobCard"]));
    } catch (error) {
      logError("Job Card Process", "startProcess", "Start-Process", error, {
        message: "Punch Failed",
      });
      Alert?.alert(
        "Failed to Start",
        "An unexpected error occurred while starting the process.",
      );
    }
  }

  async function stopProcess() {
    try {
      const numProcessQty = Number(processqty);
      const numCompletedQty = Number(completedqty);

      if (isCutAndSeal) {
        const hasAnyQty = Object.values(splitQty).some(
          (val) => Number(val) > 0,
        );
        if (!hasAnyQty) {
          return Alert?.alert(
            "Missing",
            "Please enter at least one valid quantity for split sizes!",
          );
        }
      } else {
        if (!completedqty || !Number.isFinite(numCompletedQty))
          return Alert?.alert(
            "Missing",
            "Please enter a valid completed qty.",
          );
        if (Number.isFinite(numProcessQty) && numProcessQty < numCompletedQty)
          return Alert?.alert("Qty", "You have entered Above Process Qty.!");
      }

      const punch_id = update_data?.data?.addMain_punch_log?.id ?? punchId;

      if (!punch_id)
        return Alert?.alert("Warning", "Punch Id is Missing please refresh!");

      const submitBody = {
        status: "COMPLETED",
        jobcardId: id,
        processId: processId,
        departmentId: dep,
        machineId: machineId,
        flag: "STOP",
        userId: userId,
        id: punch_id,
        completedQty: completedqty,
        wastageQty: wastageQty || 0,
        remarks: remarks || "",
        processIncomingId:
          currentRoute?.processIncomingId ?? jobcard?.processIncomingId,
        processIncomingQty:
          currentRoute?.processIncomingQty ?? jobcard?.processIncomingQty,
      };

      if (isCutAndSeal) {
        submitBody.splitSizes = Object.entries(splitQty).map(
          ([sizeId, qty]) => ({ id: Number(sizeId), qty: Number(qty) }),
        );
        submitBody.completedQty = Object.values(splitQty).reduce(
          (acc, val) => acc + Number(val || 0),
          0,
        );
      }

      var updatep = await updateprocess(submitBody)?.unwrap();

      if (Number(updatep?.statusCode) === 1) {
        logError(
          "Job Card Process",
          "stopProcess",
          "STOP_ERROR",
          updatep?.message,
          { response: updatep },
        );
        return Alert?.alert(
          "Failed to Stop",
          updatep?.message || "Unable to stop the process. Please try again.",
        );
      }

      storage.delete(mmkvKey);
      setcompletedqty(null);
      setwastageQty("");
      setRemarks("");
      // refreshjobcard()
      dispatch(JOBCARD_API.util.invalidateTags(["JobCard"]));
      navigation?.navigate("HOME", { completed: true });
    } catch (error) {
      logError("Job Card Process", "stopProcess", "Stop-Process", error, {
        message: "Punch Failed",
      });
      Alert?.alert(
        "Failed to Stop",
        "An unexpected error occurred while stopping the process.",
      );
    }
  }

  async function PauseProcess(reason, qtyFromModal) {
    try {
      const punch_id = update_data?.data?.addMain_punch_log?.id ?? punchId;

      if (!punch_id)
        return Alert?.alert("Warning", "Punch Id is Missing please refresh!");

      const combinedRemarks = `Reason: ${reason}${remarks ? ` - ${remarks}` : ""}`;

      let finalCompletedQty = completedqty;
      if (reason === "Partially Completed" && qtyFromModal) {
        finalCompletedQty = qtyFromModal;
      }

      const submitBody = {
        flag: "PAUSE",
        userId: userId,
        machineId: machineId,
        id: punch_id,
        productionlogid: punch_data?.id,
        completedQty: finalCompletedQty,
        wastageQty: wastageQty || 0,
        remarks: combinedRemarks,
        pauseReason: pauseReason,
        reason: reason,
        pauseQty: pauseQty,
        sizeswise: isCutAndSeal && isLabel,
      };

      if (isCutAndSeal) {
        submitBody.splitSizes = Object.entries(splitQty).map(
          ([sizeId, qty]) => ({ id: Number(sizeId), qty: Number(qty) }),
        );
        if (reason === "Partially Completed" && qtyFromModal) {
          submitBody.reason = reason;
          submitBody.completedQty = qtyFromModal;
        } else {
          submitBody.completedQty = Object.values(splitQty).reduce(
            (acc, val) => acc + Number(val || 0),
            0,
          );
        }
      }

      var updatepause = await update_pause_process({ ...submitBody })?.unwrap();

      if (Number(updatepause?.statusCode) === 1) {
        logError(
          "Job Card Process",
          "PauseProcess",
          "PAUSE_ERROR",
          updatepause?.message,
          { response: updatepause },
        );
        return Alert?.alert(
          "Failed to Pause",
          updatepause?.message ||
            "Unable to pause the process. Please try again.",
        );
      }

      // refreshjobcard()
      setresumable(true);
      dispatch(JOBCARD_API.util.invalidateTags(["JobCard"]));
      // navigation?.navigate("HOME")
    } catch (error) {
      logError("Job Card Process", "PauseProcess", "pause-Process", error, {
        message: "Punch Failed",
      });
      Alert?.alert(
        "Failed to Pause",
        "An unexpected error occurred while pausing the process.",
      );
    }
  }

  async function ResumeProcess() {
    try {
      const punch_id = update_data?.data?.addMain_punch_log?.id ?? punchId;

      if (!punch_id)
        return Alert?.alert("Warning", "Punch Id is Missing please refresh!");

      var updatepause = await update_pause_process({
        flag: "RESUME",
        userId: userId,
        id: punch_id,
        productionlogid: punch_data?.id,
      })?.unwrap();

      if (Number(updatepause?.statusCode) === 1) {
        logError(
          "Job Card Process",
          "ResumeProcess",
          "RESUME_ERROR",
          updatepause?.message,
          { response: updatepause },
        );
        return Alert?.alert(
          "Failed to Resume",
          updatepause?.message ||
            "Unable to resume — this machine is currently allocated to another employee.",

          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancelled"),
              style: "cancel",
            },
            {
              text: "Stop Process",
              onPress: () => stopProcess(),
              style: "default",
            },
          ],
          { cancelable: true },
        );
      }
      setresumable(false);
      setpauseable(true);
      // refreshjobcard()
      dispatch(JOBCARD_API.util.invalidateTags(["JobCard"]));
      // navigation?.navigate("HOME")
    } catch (error) {
      Alert?.alert("Failed", "Resume Process Failed to Proceed.");
      logError("Job Card Process", "PauseProcess", "pause-Process", error, {
        message: "Punch Failed",
      });
    }
  }

  useEffect(() => {

    

    if (machineId && (!machineEndCheck || machineEndCheck === "")) {
      setSelectedMachine(machineId);
      setlockmachine(true);
    }

    if (punch_data?.id && !punch_data?.endTime) {
      const pushLogsRev = Array.isArray(punch_data?.pushLogs)
        ? [...punch_data.pushLogs].reverse()
        : [];
      var resumecheck = pushLogsRev.find((flast) => !flast?.resumetime);
      var pauseheck = pushLogsRev.find((flast) => flast?.pushtime);
      setpunchId(punch_data?.id);
      if (resumecheck) {
        setresumable(true);
      } else if (pauseheck || punch_data?.id) {
        setpauseable(true);
      }
    }
  }, [machineId, punch_data]);

  useEffect(() => {
   
    if (!update_data) return;
    const punch_id = update_data?.data?.addMain_punch_log;
    setpunchId(punch_id?.id);
  
    if (punch_id?.id ) setlockmachine(true);
  }, [update_data]);

  useEffect(() => {
    if (jobcard) {
      const allRoutes = jobcard.allProcessRoutes || [];
      const curr = currentRoute;
      const prevSq = curr?.sequence ? Number(curr.sequence) - 1 : null;

      if (prevSq) {
        const prevRoute = allRoutes.find((r) => Number(r.sequence) === prevSq);
        if (prevRoute) {
          const isPrevCompleted = prevRoute.status === "COMPLETED";
          const isPrevPartiallyCompleted =
            prevRoute.status === "PARTIALLY_COMPLETED" &&
            prevRoute.completedQty > 0;
          const prevAllocation = prevRoute.productionAllocationDtls?.[0];

          const isOutside =
            prevAllocation && prevAllocation.isInHouse === false;

          if (isOutside && !isPrevCompleted && !isPrevPartiallyCompleted) {
            const prevProcessName = prevRoute?.Process?.name || "Previous";
            Alert.alert(
              "Information",
              `The previous process (${prevProcessName}) is outside and still not completed.`,
              [
                {
                  text: "OK",
                  onPress: () => {
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      navigation.navigate("HOME");
                    }
                  },
                },
              ],
              { cancelable: false },
            );
          }
        }
      }
    }
  }, [jobcard]);

  if (isLoading || deparmentloading || updateloading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
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
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", gap: 12 },
        ]}
      >
        <AlertCircle size={40} color={c.textMuted} />
        <AppText variant="sm" muted>
          Job Card not found
        </AppText>
      </View>
    );
  }

  if (!canStart && currentRoute) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            padding: spacing.xl,
          },
        ]}
      >
        <AlertCircle size={40} color={c.error ?? "#FF4444"} />
        <AppText
          align="center"
          style={{ color: c.error ?? "#FF4444", fontWeight: "700" }}
        >
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
      refreshControl={
        // ← add this
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <InfoRow label="Job Card ID" c={c} spacing={spacing} styles={styles}>
          <AppText style={{ color: c.textMuted }}>
            {jobcard?.docId ?? jobCardDocId ?? "N/A"}
          </AppText>
        </InfoRow>

        <View style={styles.divider} />

        <InfoRow label="Customer" c={c} spacing={spacing} styles={styles}>
          <AppText style={{ color: c.textMuted }}>
            {jobcard?.customer?.name ?? "—"}
          </AppText>
        </InfoRow>

        <View style={styles.divider} />

        {/* <InfoRow label="GSM" c={c} spacing={spacing} styles={styles}>
          <AppText style={{ color: c.textMuted }}>
            {jobcard?.gsm?.name ?? '—'}
          </AppText>
        </InfoRow> */}

        {isnotLabel && (
          <>
            <View style={styles.divider} />

            <InfoRow
              label="Running Qty"
              c={c}
              spacing={spacing}
              styles={styles}
            >
              <AppText style={{ color: c.textMuted }}>
                {jobcard?.runningQty ?? "—"}
              </AppText>
            </InfoRow>
          </>
        )}

        {isnotLabel && (
          <>
            <InfoRow label="Gsm & Size" c={c} spacing={spacing} styles={styles}>
              <AppText style={{ color: c.textMuted }}>
                {(() => {
                  const bqList = jobcard?.boardQualities || [];
                  const processBqList = bqList.filter(
                    (b) =>
                      b?.processId === currentRoute?.Process?.id ||
                      b?.Process?.id === currentRoute?.Process?.id,
                  );

                  const listToUse =
                    processBqList.length > 0 ? processBqList : bqList;

                  return (
                    listToUse
                      .map((b) => {
                        const sizeName =
                          b?.FullBoardSize?.name || b?.FullBoardSize || "—";
                        return `${b?.gsm?.name ?? 0} (Size: ${sizeName})`;
                      })
                      .join(" | ") || "—"
                  );
                })()}
              </AppText>
            </InfoRow>

            <View style={styles.divider} />
          </>
        )}

        {isnotLabel && (
          <>
            <InfoRow
              label="No. of Sheets"
              c={c}
              spacing={spacing}
              styles={styles}
            >
              <AppText style={{ color: c.textMuted }}>
                {(() => {
                  const bqList = jobcard?.boardQualities || [];
                  const processBqList = bqList.filter(
                    (b) =>
                      b?.processId === currentRoute?.Process?.id ||
                      b?.Process?.id === currentRoute?.Process?.id,
                  );

                  const listToUse =
                    processBqList.length > 0 ? processBqList : bqList;

                  return (
                    listToUse
                      .map((b) => {
                        const sizeName =
                          b?.FullBoardSize?.name || b?.FullBoardSize || "—";
                        return `${b?.noOfSheets ?? 0}`;
                      })
                      .join(" | ") || "—"
                  );
                })()}
              </AppText>
            </InfoRow>

            <View style={styles.divider} />
          </>
        )}

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
            {currentRoute?.Process?.name ?? "—"}
          </AppText>
        </InfoRow>

        <View style={styles.divider} />

        <InfoRow label="Current Status" c={c} spacing={spacing} styles={styles}>
          <AppText style={{ color: c.textMuted }}>
            {currentRoute?.status ? currentRoute.status.replace("_", " ") : "—"}
          </AppText>
        </InfoRow>

        {isnotLabel ? (
          <>
            <InfoRow
              label="Production Qty"
              c={c}
              spacing={spacing}
              styles={styles}
            >
              <AppText style={{ color: c.textMuted }}>
                {processqty ?? "0"}
              </AppText>
            </InfoRow>
          </>
        ) : (
          <>
            <InfoRow label="Roll Qty" c={c} spacing={spacing} styles={styles}>
              <AppText style={{ color: c.textMuted }}>
                {processqty ?? "0"}
              </AppText>
            </InfoRow>
          </>
        )}

        <InfoRow label="Item Name" c={c} spacing={spacing} styles={styles}>
          <AppText style={{ color: c.textMuted }}>
            {jobcard?.StyleItem?.name ?? "-"}
          </AppText>
        </InfoRow>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingHorizontal: spacing.md,
          marginTop: spacing.lg,
          width: "100%",
        }}
      >
        {/* Column 1: Available Machines */}
        <View style={{ width: "48%", marginBottom: 0 }}>
          <AppSearchableDropdown
            options={machineOptions}
            disable_key={"busy"}
            concat_key={"useby"}
            concat_prefix={"- In Use ("}
            concat_subfix={")"}
            label="Select Machine"
            disabled={lockmachine}
            value={selectedMachine}
            onChange={(opt) => setSelectedMachine(opt?.value)}
            placeholder="Select Machine"
          />
        </View>

        {/* Column 2: Completed Qty (or Split Sizes) */}
        <View style={{ width: "48%", marginBottom: 0 }}>
          {isCutAndSeal && jobcard?.jobCardSizeDetails?.length > 0 ? (
            <View>
              <AppText
                variant="sm"
                muted
                style={{ marginBottom: spacing.xs, marginLeft: spacing.xs }}
              >
                Split Sizes Qty
              </AppText>
              <TouchableOpacity
                disabled={!isProcessStarted}
                onPress={() => setappModalOpen_sqty(true)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderWidth: borderWidth.thin,
                  borderColor: c.border,
                  borderRadius: radius?.md,
                  alignItems: "center",
                  paddingHorizontal: spacing.sm,
                  height: 50,
                  marginTop: spacing.xs,
                  width: "100%",
                  opacity: !isProcessStarted ? 0.5 : 1,
                }}
              >
                <AppText
                  variant="sm"
                  style={{
                    color:
                      Object.keys(splitQty).length > 0 &&
                      Object.values(splitQty).some((val) => Number(val) > 0)
                        ? c.text
                        : c.textMuted,
                    marginLeft: spacing.xs,
                  }}
                  numberOfLines={1}
                >
                  {Object.keys(splitQty).length > 0 &&
                  Object.values(splitQty).some((val) => Number(val) > 0)
                    ? Object.entries(splitQty)
                        .filter(([_, qty]) => Number(qty) > 0)
                        .map(([sId, qty]) => {
                          const sizeObj = jobcard?.jobCardSizeDetails?.find(
                            (s) => String(s.id) === String(sId),
                          );
                          const sizeName =
                            sizeObj?.Size?.name || sizeObj?.sizeId || "Size";
                          return `${sizeName} (${qty})`;
                        })
                        .join(", ")
                    : "Sizes"}
                </AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <AppText
                style={[
                  {
                    fontSize: typography.sm.fontSize,
                    color: c.textMuted,
                    marginBottom: spacing.xs,
                    marginLeft: spacing.xs,
                  },
                ]}
              >
                Completed Qty
              </AppText>
              <AppInput
                placeholder="Completed Qty"
                value={completedqty}
                editable={isProcessStarted}
                containerStyle={{ opacity: !isProcessStarted ? 0.5 : 1 }}
                onChangeText={(text) => {
                  if (text === "") {
                    setcompletedqty("");
                    return;
                  }

                  const num = Number(text);
                  // Block non-numeric input entirely and values exceeding processqty
                  if (!Number.isFinite(num)) return;
                  
                  const maxQty = Number(processqty) || 0;
                  const currentWastage = Number(wastageQty) || 0;
                  if (num + currentWastage > maxQty) {
                    Alert.alert("Qty", "Total of Completed Qty and Wastage Qty cannot exceed Process Qty!");
                    return;
                  }

                  setcompletedqty(text);
                }}
                keyboardType="number"
                autoCapitalize="none"
                autoCorrect={false}
                error={qtyerror}
              />
            </View>
          )}
        </View>

        {/* Column 3: Wastage Qty */}
        <View style={{ width: "48%", marginBottom: 0 }}>
          <AppText
            style={[
              {
                fontSize: typography.sm.fontSize,
                color: c.textMuted,
                marginBottom: spacing.xs,
                marginLeft: spacing.xs,
              },
            ]}
          >
            Wastage Qty
          </AppText>
          <AppInput
            placeholder="Wastage"
            value={wastageQty}
            editable={isProcessStarted}
            containerStyle={{ opacity: !isProcessStarted ? 0.5 : 1 }}
            onChangeText={(text) => {
              if (text === "") {
                setwastageQty("");
                return;
              }
              const num = Number(text);
              if (!Number.isFinite(num)) return;
              
              const maxQty = Number(processqty) || 0;
              let currentCompleted = 0;
              if (isCutAndSeal) {
                currentCompleted = Object.values(splitQty).reduce((acc, val) => acc + Number(val || 0), 0);
              } else {
                currentCompleted = Number(completedqty) || 0;
              }
              
              if (num + currentCompleted > maxQty) {
                Alert.alert("Qty", "Total of Completed Qty and Wastage Qty cannot exceed Process Qty!");
                return;
              }
              
              setwastageQty(text);
            }}
            keyboardType="number"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Column 4: Remarks */}
        <View style={{ width: "48%", marginBottom: 0 }}>
          <AppText
            style={[
              {
                fontSize: typography.sm.fontSize,
                color: c.textMuted,
                marginBottom: spacing.xs,
                marginLeft: spacing.xs,
              },
            ]}
          >
            Remarks
          </AppText>
          <AppInput
            placeholder="Remarks"
            value={remarks}
            editable={isProcessStarted}
            containerStyle={{ opacity: !isProcessStarted ? 0.5 : 1 }}
            onChangeText={(text) => setRemarks(text)}
            autoCapitalize="sentences"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.actionRow}>
        {pauseable && !resumable ? (
          <ActionButton
            label="Pause"
            color={c.secprimary ?? "#22C55E"}
            disabled={!canStart || !selectedMachine}
            c={c}
            styles={styles}
            onPress={() => setPauseModalOpen(true)}
          />
        ) : !resumable ? (
          <ActionButton
            label="Start"
            color={c.btnprimary ?? "#22C55E"}
            disabled={!canStart || !selectedMachine}
            c={c}
            styles={styles}
            onPress={startProcess}
          />
        ) : (
          <ActionButton
            label="Resume"
            color={c.btnprimary ?? "#22C55E"}
            disabled={!canStart || !selectedMachine}
            c={c}
            styles={styles}
            onPress={ResumeProcess}
          />
        )}

        <ActionButton
          label="Stop"
          color={c.btnprimary ?? "#22C55E"}
          disabled={!canStart || resumable || !selectedMachine}
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

      <AppModal
        visible={appModalOpen_sqty}
        onClose={() => setappModalOpen_sqty(false)}
        type="center" // ✅ explicit center
        size="medium"
        title="Split Sizes" // ✅ header needs a title
        showHeader={true}
        closeOnBackdrop={true}
      >
        <View style={{ paddingTop: spacing.sm, paddingBottom: spacing.lg }}>
          {jobcard?.jobCardSizeDetails?.map((sizeObj, idx) => (
            <View
              key={sizeObj?.id || idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: spacing.md,
              }}
            >
              <AppText
                style={{
                  flex: 1,
                  color: c.textMuted,
                  fontSize: typography.sm.fontSize,
                  fontWeight: "500",
                }}
              >
                {sizeObj?.Size?.name || sizeObj?.sizeId || `Split ${idx + 1}`} (
                {sizeObj?.qty ?? 0})
              </AppText>
              <View style={{ flex: 1.2 }}>
                <AppInput
                  placeholder="Qty"
                  value={splitQty[sizeObj?.id]?.toString() || ""}
                  onChangeText={(text) => {
                    if (text === "") {
                      setSplitQty((prev) => ({ ...prev, [sizeObj?.id]: "" }));
                      return;
                    }
                    const num = Number(text);
                    if (!Number.isFinite(num)) return;

                    const newSplitQty = { ...splitQty, [sizeObj?.id]: text };
                    const newTotalCompleted = Object.values(newSplitQty).reduce((acc, val) => acc + Number(val || 0), 0);
                    const maxQty = Number(processqty) || 0;
                    const currentWastage = Number(wastageQty) || 0;

                    if (newTotalCompleted + currentWastage > maxQty) {
                      Alert.alert("Qty", "Total of Completed Qty and Wastage Qty cannot exceed Process Qty!");
                      return;
                    }
                    setSplitQty(newSplitQty);
                  }}
                  keyboardType="number"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          ))}
        </View>

        <AppButton
          label="Update size"
          variant="primary"
          onPress={() => {
            setappModalOpen_sqty(false);
          }}
          size="md"
          icon={ArrowRight}
          iconPosition="right"
        />
      </AppModal>

      <AppModal
        visible={pauseModalOpen}
        onClose={() => {
          setPauseModalOpen(false);
          setPauseReason("");
          setPauseQty("");
          setPauseRemarks("");
        }}
        scrollable={true}
        type="center"
        size="medium"
        title="Pause Job"
        showHeader={true}
        closeOnBackdrop={true}
      >
        <View style={{ paddingTop: spacing.sm, paddingBottom: spacing.lg }}>
          <AppSearchableDropdown
            options={PAUSE_REASONS}
            label="Select Reason"
            value={pauseReason}
            onChange={(opt) => setPauseReason(opt?.value || "")}
            placeholder="Select Reason"
          />

          {(pauseReason === "Partially Completed" ||
            pauseReason === "Others") &&
            !isCutAndSeal && (
              <View style={{ marginTop: spacing.md }}>
                <AppText
                  style={{
                    marginBottom: spacing.xs,
                    fontSize: typography.sm.fontSize,
                    color: c.textMuted,
                  }}
                >
                  Completed Qty <AppText style={{ color: "red" }}>*</AppText>
                </AppText>
                <AppInput
                  placeholder="Enter quantity"
                  value={pauseQty}
                  onChangeText={(text) => {
                    const num = Number(text);
                    if (!Number.isFinite(num) && text !== "") return;
                    setPauseQty(text);
                  }}
                  keyboardType="number"
                />
              </View>
            )}

          {pauseReason === "Partially Completed" && isCutAndSeal && (
            <View style={{ marginTop: spacing.md }}>
              <AppText
                style={{
                  marginBottom: spacing.xs,
                  fontSize: typography.sm.fontSize,
                  color: c.textMuted,
                }}
              >
                Enter Split Sizes <AppText style={{ color: "red" }}>*</AppText>
              </AppText>

              {jobcard?.jobCardSizeDetails?.map((sizeObj, idx) => (
                <View
                  key={sizeObj?.id || idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: spacing.sm,
                  }}
                >
                  <AppText
                    style={{
                      flex: 1,
                      color: c.textMuted,
                      fontSize: typography.sm.fontSize,
                      fontWeight: "500",
                    }}
                  >
                    {sizeObj?.Size?.name ||
                      sizeObj?.sizeId ||
                      `Split ${idx + 1}`}{" "}
                    ({sizeObj?.qty ?? 0})
                  </AppText>
                  <View style={{ flex: 1.2 }}>
                    <AppInput
                      placeholder="Qty"
                      value={splitQty[sizeObj?.id]?.toString() || ""}
                      onChangeText={(text) => {
                        const num = Number(text);
                        if (!Number.isFinite(num) && text !== "") return;
                        setSplitQty((prev) => ({
                          ...prev,
                          [sizeObj?.id]: text,
                        }));
                      }}
                      keyboardType="number"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {pauseReason === "Others" && (
            <View style={{ marginTop: spacing.md }}>
              <AppText
                style={{
                  marginBottom: spacing.xs,
                  fontSize: typography.sm.fontSize,
                  color: c.textMuted,
                }}
              >
                Remarks <AppText style={{ color: "red" }}>*</AppText>
              </AppText>
              <AppInput
                placeholder="Enter remarks"
                value={pauseRemarks}
                onChangeText={setPauseRemarks}
                autoCapitalize="sentences"
              />
            </View>
          )}

          <View style={{ marginTop: spacing.lg, alignItems: "center" }}>
            <AppButton
              label="Confirm Pause"
              variant="primary"
              onPress={() => {
                if (!pauseReason) {
                  return Alert?.alert(
                    "Required",
                    "Please select a reason for pausing.",
                  );
                }
                if (pauseReason === "Partially Completed") {
                  if (isCutAndSeal) {
                    const totalSplitQty = Object.values(splitQty).reduce(
                      (acc, val) => acc + Number(val || 0),
                      0,
                    );
                    if (totalSplitQty <= 0) {
                      return Alert?.alert(
                        "Required",
                        "Please enter valid quantities for split sizes.",
                      );
                    }
                    if (totalSplitQty > Number(processqty)) {
                      return Alert?.alert(
                        "Invalid",
                        "Total quantity cannot exceed Production Qty.",
                      );
                    }
                  } else {
                    if (!pauseQty || Number(pauseQty) <= 0) {
                      return Alert?.alert(
                        "Required",
                        "Please enter a valid quantity.",
                      );
                    }
                    if (Number(pauseQty) > Number(processqty)) {
                      return Alert?.alert(
                        "Invalid",
                        "Quantity cannot exceed Production Qty.",
                      );
                    }
                  }
                }
                if (
                  pauseReason === "Others" &&
                  (!pauseRemarks || !pauseRemarks.trim())
                ) {
                  return Alert?.alert(
                    "Required",
                    "Please enter remarks for 'Others'.",
                  );
                }

                const finalReason =
                  pauseReason === "Others"
                    ? `Others - ${pauseRemarks.trim()}`
                    : pauseReason;
                PauseProcess(
                  finalReason,
                  pauseReason === "Partially Completed" && !isCutAndSeal
                    ? pauseQty
                    : null,
                );

                setPauseModalOpen(false);
                setPauseReason("");
                setPauseQty("");
                setPauseRemarks("");
              }}
              size="md"
              style={{ width: "100%" }}
            />
          </View>
        </View>
      </AppModal>
    </ScrollView>
  );
}

const makeStyles = (c, spacing, radius) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      paddingHorizontal: spacing.md,
    },

    // ─── Info Card ────────────────────
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      marginTop: spacing.md,
      overflow: "hidden",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
    },

    // ─── Section ──────────────────────
    section: {
      marginTop: spacing.lg,
      alignItems: "center",
    },

    // ─── Action Buttons ───────────────
    actionRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.xl,
      marginTop: spacing.lg,
    },
    actionBtn: {
      width: 130,
      height: 130,
      borderRadius: 65,
      borderWidth: 4,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
  });

export default JobCardProcess;
