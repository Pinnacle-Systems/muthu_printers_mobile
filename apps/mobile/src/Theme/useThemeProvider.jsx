import { useTheme } from "./ThemeContext"

const useThemeProvider = () => {
  const { theme, mode } = useTheme()
  const { thememode, setthememode } = mode

  const current_theme = thememode === "white" ? theme?.whitetheme : theme?.darktheme

  return { current_theme, theme, mode, thememode, setthememode }
}

export default useThemeProvider 