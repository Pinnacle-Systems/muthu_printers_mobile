export const whitetheme = { primary: '#1c1f1f', secondary: '#FF6584', background:'#FFFFFF', surface: '#F5F5F5', text: '#1A1A2E', textMuted: '#6B7280', border: '#E5E7EB', success: '#10B981', error: '#EF4444', warning: '#F59E0B', }; 
export const darktheme = {
  primary:    '#e5e5e9',  // brightened for dark bg
  secondary:  '#FF7A95',  // accent only, not text
  background: '#17171a',  // base canvas
  surface:    '#1A1A2E',  // cards & panels
  surfaceHigh:'#242438',  // hover / elevated
  text:       '#E2E0FF',  // 15.8:1 on background
  textMuted:  '#fbfbfde3',  // 5.1:1 — AA pass
  border:     '#2E2E48',  // subtle dividers
  success:    '#0D9E6E',  // icons & badges
  error:      '#F05252',  // 4.6:1 — AA pass
  warning:    '#F0A500',  // icons & badges only
  placeHolder_text : '#d7d6e075'
};
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, }; 
export const typography = { h1: { fontSize: 28, fontWeight: '700' }, h2: { fontSize: 22, fontWeight: '600' }, h3: { fontSize: 18, fontWeight: '600' }, body: { fontSize: 15, fontWeight: '400' }, sm: { fontSize: 13, fontWeight: '400' }, }; 
export const radius = { sm: 6, md: 12, lg: 20, full: 9999, }; 
export const theme = {    whitetheme,darktheme, spacing, typography, radius };