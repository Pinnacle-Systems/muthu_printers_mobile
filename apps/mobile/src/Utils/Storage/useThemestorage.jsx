import   {useMMKVString}  from "react-native-mmkv"

export function useThemeStorage(){    
const [thememode,setthememode] = useMMKVString("theme")

return {thememode : thememode ?? "white" ,setthememode}

}



