import React, { useEffect, useState, memo } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ScanBarcode, ScanQrCode } from "lucide-react-native";
import useThemeProvider from "../../Theme/useThemeProvider";
import AppButton from "../../components/AppButton.jsx";
import AppText from "../../components/Text.jsx";
import AppSearchableDropdown from "../../components/AppSearchableDropdown.jsx";
import AppTable from "../../components/AppTable.jsx";
import { useDepartmentHooks } from "../../services/hooks/useDeparmentHooks.jsx";
import { useJobCardHooks } from "../../services/hooks/useJobCardHooks.jsx";
import QRScanner from "../../components/QRScanner.jsx";
import AppModal from "../../components/AppModal.jsx";


const Header = memo(({ setshowscanner, iconSize, spacing, wp, hp, c }) => (
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
      onPress={() => setshowscanner(true)}
      label="Scan Job Card"
    />
  </View>
));

const Body = memo(({ iconSize, spacing, wp, hp, c, dropdown, table ,navigation }) => (
  <View style={{
    height:         hp(80),
    padding:        spacing.md,
    flexDirection:  "column",
    gap:            20,
    alignItems:     "center",
    justifyContent: "flex-start",
  }}>

    <AppSearchableDropdown
      widthPercent={80}
      disabled={dropdown?.isLoading}
      options={dropdown?.options}
      label="Select Department"
      value={dropdown?.selected}
      onChange={option => dropdown?.setSelected(option.value)}
      placeholder="Select Department"
    />

    <AppTable
      widthPercent={90}
      maxHeight={hp(40)}
      columns={table?.columns}
      data={table?.data}
      loading={table?.isLoading}
      striped
      sortable
      showIndex
    maxHeight={hp(40)}
    minHeight={hp(20)} 
      pagination
      serverSide
      currentPage={table?.page}
      totalCount={table?.totalCount}
      pageSize={table?.perPage}
      pageSizeOptions={[5, 10, 20, 50]}
      onPageChange={table?.onPageChange}   
      onRowPress={row => navigation?.navigate("JOB",{
                   jobCardId:    row?.jobCardId,id:row?.id })}
    />

  </View>
));


const convertDepartmentData = (data) =>
  data?.map((dep) => ({ label: dep?.name, value: dep?.id }));

const convertJobCardData = (data) =>
  data?.map((job) => ({
    jobCardId:    job?.docId,
    currentState: job?.processRoute?.status,
    process:      job?.processRoute?.type,
    id:job?.id
  }));


export const HomeScreen = ({ navigation } = {}) => {

  const [selected,    setSelected]    = useState(null);
  const [showQrcode,  setShowQrcode]  = useState(false);

 
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { getDepartments } = useDepartmentHooks();
  const {
    data:      deptData,
    isLoading: isLoadingDep,
  } = getDepartments;


  
  const { getJobCardList } = useJobCardHooks({getJobCardList_params : {
     pagination:true,
     pageNumber:page,
     dataPerPage:perPage}});

  const {
    data:      jobCardData,
    isLoading: isLoadingJobs,
  } = getJobCardList;

  const dep_options = convertDepartmentData(deptData?.data);
  const jobs        = convertJobCardData(jobCardData?.data) ?? [];
  const totalCount  = jobCardData?.totalCount ?? 0;  

 
  const handlePageChange = (newPage, newPerPage) => {
    setPage(newPage);
    setPerPage(newPerPage);
  };

  const columns = [
    { key: 'jobCardId',    title: 'Job Card ID',   flex: 1.1 },
    { key: 'currentState', title: 'Current State', flex: 1 },
    { key: 'process',      title: 'Process',       flex: 1, align: 'center' },
  ];

  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, radius, typography, iconSize, Screens } = theme;
  const { wp, hp } = Screens;
  const styles = makeStyles(c, spacing, radius, typography);

  return (
    <View style={styles.container}>

      <Header
        setshowscanner={setShowQrcode}
        iconSize={iconSize}
        spacing={spacing}
        wp={wp}
        hp={hp}
        c={c}
      />

      {/* ✅ QR Scanner Modal */}
      <AppModal
        visible={showQrcode}
        onClose={() => setShowQrcode(false)}
        type="fullscreen"
        showHeader={false}
      >
        <QRScanner
          onScan={(data) => {
            console.log('Scanned:', data);
            setShowQrcode(false);
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
        navigation={navigation}
        dropdown={{
          selected,
          setSelected,
          options:   dep_options,
          isLoading: isLoadingDep,
        }}
        table={{
          columns,
          data:         jobs,
          isLoading:    isLoadingJobs,
          // ✅ pagination
          page,
          perPage,
          totalCount,
          onPageChange: handlePageChange,
        }}
      />

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