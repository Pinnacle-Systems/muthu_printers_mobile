import { Bell, LogOut, Moon, Settings, Sun } from "lucide-react-native"
import AppHeader from "../components/AppHeader"
import { HomeScreen } from "../screens/Jobcard/HomeScreen"
import JobcardProcess from "../screens/Jobcard_process/JobcardProcess"


const Pages = [{
       name : "HOME",
       component : HomeScreen,
     optional: {
    headerShown: true,
    header: ({ navigation, route, options }) => (
      <AppHeader
        title="Job Card Selection"
        rightIcons={[
          { key: 'bell', icon: {dark : Moon , white: Sun} , theme : {change : true} },
          { key: 'settings', icon: LogOut, logout :true },
        ]}
      />
    ),
  }

},
{
    name : "JOB",
    component : JobcardProcess,
    optional: {
    headerShown: true,
    
    header: ({ navigation, route, options }) => (
      <AppHeader
        title="Job Card"
        showBack={true}
        rightIcons={[
          { key: 'bell', icon: {dark : Moon , white: Sun} , theme : {change : true} },
          { key: 'settings', icon: LogOut, logout :true },
        ]}
      />
    ),
  }
}
]

export default  Pages