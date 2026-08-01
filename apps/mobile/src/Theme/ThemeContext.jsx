import { createContext, useContext, useEffect } from "react"
import  {theme} from "./index"
import {useThemeStorage} from "../Utils/Storage/useThemestorage"


const Themecontext = createContext(theme)

 const ThemeContextProvider = ({children})=>{
      const {thememode,setthememode} = useThemeStorage()

      const Storage_mode = {theme:theme , mode : {thememode,setthememode} }
    return (
       <Themecontext.Provider value={Storage_mode} >{children}</Themecontext.Provider>
    )
}


export const useTheme = () => useContext(Themecontext);

export default ThemeContextProvider