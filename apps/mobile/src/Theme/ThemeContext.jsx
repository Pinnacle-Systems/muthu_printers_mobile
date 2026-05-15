import { createContext } from "react"
import  {theme} from "./index"


const Themecontext = createContext(theme)

export const ThemeContextProvider = ({children})=>{

    return (
       <Themecontext.Provider value={theme}>{children}</Themecontext.Provider>
    )
}


export const useTheme = () => useContext(Themecontext);