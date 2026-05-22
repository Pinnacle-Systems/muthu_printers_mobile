import React, { useEffect, useState, memo } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ScanBarcode } from "lucide-react-native";
import useThemeProvider from "../../Theme/useThemeProvider";
import AppButton from "../../components/AppButton.jsx";
import AppText from "../../components/Text.jsx";
// import AppDropdown from "../../components/AppDropdown.jsx";
import AppSearchableDropdown from "../../components/AppSearchableDropdown.jsx";
import AppTable from "../../components/AppTable.jsx";
import { useDepartmentHooks } from "../../services/hooks/useDeparmentHooks.jsx";
import { useJobCardHooks } from "../../services/hooks/useJobCardHooks.jsx";



const Header = memo(({ iconSize, spacing, wp, hp, c }) => (
  <View style={{
    height:        hp(20),              
    padding:       spacing.md,
    flexDirection: "column",          
    gap:           20,
    alignItems:    "center",
    justifyContent:"center",
  }}>
    <ScanBarcode
      size={iconSize.mxl}              
      strokeWidth={1.5}               
      color={c.text}
    />
    <AppButton
      style={{ width: wp(80) }}
      label="Scan Job Card"
    />
  </View>
));

const Body = memo(({ iconSize, spacing, wp, hp, c , dropdown, table}) => (
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
  label={"Select Department"}
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
  onRowPress={row => console.log(row)}
/>
    
  </View>
));

const convertDeparmentData =(data)=>{
  return data?.map((dep)=>({ label: dep?.name , value: dep?.id }))
}

const convertJobCardData = (data) => {
  return data?.map((job) => ({
    jobCardId:    job?.jobCardId,
    currentState: job?.currentState,
    process:      job?.process,
  }));
};



export const HomeScreen = ({ navigation } = {}) => {
  const [health,    setHealth]    = useState(null);
  const [error,     setError]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);

    const { getDepartments } = useDepartmentHooks();
   const { data, isLoading:isloadingdep, isError } = getDepartments;

   const { getJobCardList } = useJobCardHooks();
   const { data: jobCardData, isLoading: isLoadingJobs } = getJobCardList;

   

     const dep_options = convertDeparmentData(data?.data)

     const columns = [
   { key: 'jobCardId',    title: 'Job Card ID',    flex: 1 },
    { key: 'currentState', title: 'Current State',  flex: 1 },
    { key: 'process',      title: 'Process',        flex: 1, align: 'center' },
     ];


  const jobs = convertJobCardData(jobCardData?.data) ?? [];

  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, radius, typography, iconSize, Screens } = theme;
  const { wp, hp } = Screens;

  const styles = makeStyles(c, spacing, radius, typography);

  const loadHealth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getHealth();
      setHealth(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to reach API");
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadHealth(); }, []);

  return (
    <View style={styles.container}>
    
      <Header iconSize={iconSize} spacing={spacing} wp={wp} hp={hp} c={c} />
      <AppText variant="sm" muted align="center" style={{marginTop:20}}>OR</AppText>
      <Body  iconSize={iconSize} spacing={spacing} wp={wp} hp={hp} c={c} dropdown={{selected, setSelected , options : dep_options  , isLoading : isloadingdep }} table={{columns,data:jobs,isLoading:isLoadingJobs}}  />
    </View>
  );
};


const makeStyles = (c, spacing, radius, typography) => StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: c.background,
    paddingHorizontal: spacing.md
  },
  content: {
    gap:              spacing.md,
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