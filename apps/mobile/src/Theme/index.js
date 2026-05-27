import { Dimensions, Platform, StatusBar } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


const isSmallPhone  = SCREEN_HEIGHT < 668;   // iPhone SE, small Androids
const isMediumPhone = SCREEN_HEIGHT >= 668 && SCREEN_HEIGHT < 812;
const isLargePhone  = SCREEN_HEIGHT >= 812;  // iPhone X+, modern Androids
const isTablet      = SCREEN_WIDTH  >= 768;


export const STATUS_BAR_HEIGHT = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? 24)
  : 44;

export const NAV_BAR_HEIGHT = Platform.OS === 'android' ? 48 : 34



export const Screens = {

  // ── Raw dimensions ───────────────────────────────────────────────────────
  width:           SCREEN_WIDTH,
  height:          SCREEN_HEIGHT,

  // ── Header heights ───────────────────────────────────────────────────────
  header_xs:       40,   // compact / modal header
  header_sm:       48,   // tight screens
  header_md:       52,   // default (recommended)
  header_lg:       60,   // large title style
  header_xl:       72,   // hero / expanded header

  // ── System bars ──────────────────────────────────────────────────────────
  statusBar:       STATUS_BAR_HEIGHT,
  navBar:          NAV_BAR_HEIGHT,

  // ── Screen padding ───────────────────────────────────────────────────────
  paddingH:        isTablet ? 32 : 20,       // horizontal screen padding
  paddingV:        isTablet ? 24 : 16,       // vertical screen padding

  // ── Responsive width helpers ─────────────────────────────────────────────
  wp: (percent) => SCREEN_WIDTH  * (percent / 100),   // wp(50) = 50% width
  hp: (percent) => SCREEN_HEIGHT * (percent / 100),   // hp(10) = 10% height

  // ── Component widths ─────────────────────────────────────────────────────
  buttonFull:      SCREEN_WIDTH - 40,        // full-width button
  buttonHalf:      (SCREEN_WIDTH - 48) / 2,  // two side-by-side buttons
  cardWidth:       SCREEN_WIDTH - 40,        // standard card
  cardWidthSm:     (SCREEN_WIDTH - 48) / 2,  // two-column card
  cardWidthThird:  (SCREEN_WIDTH - 52) / 3,  // three-column card

  // ── Modal / Sheet heights ────────────────────────────────────────────────
  sheetSm:         SCREEN_HEIGHT * 0.35,     // small bottom sheet
  sheetMd:         SCREEN_HEIGHT * 0.50,     // half screen sheet
  sheetLg:         SCREEN_HEIGHT * 0.75,     // large sheet
  sheetFull:       SCREEN_HEIGHT * 0.92,     // near fullscreen sheet

  // ── Image / Avatar sizes ─────────────────────────────────────────────────
  avatarXs:        24,
  avatarSm:        32,
  avatarMd:        48,
  avatarLg:        64,
  avatarXl:        96,

  // ── Device flags ─────────────────────────────────────────────────────────
  isSmallPhone,
  isMediumPhone,
  isLargePhone,
  isTablet,
};


export const whitetheme = { primary: '#1c1f1f',btnprimary: '#30c268', secondary: '#FF6584', background:'#FFFFFF', surface: '#F5F5F5', text: '#1A1A2E', textMuted: '#6B7280', border: '#E5E7EB', success: '#10B981', error: '#EF4444', warning: '#F59E0B', }; 
export const darktheme = {
  primary:    '#e5e5e9',  // brightened for dark bg 
  btnprimary: '#30c268',
  secprimary: '#3032c2',
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
export const iconSize = {
  xs:  12,   // tiny indicators, badges
  sm:  16,   // inline text icons
  md:  20,   // default / most used
  lg:  24,   // buttons, headers
  xl:  32,   // feature icons, empty states
  xxl: 48,   // illustrations, onboarding
  mxl: 120
};



export const typography = { h1: { fontSize: 28, fontWeight: '700' }, h2: { fontSize: 22, fontWeight: '600' }, h3: { fontSize: 18, fontWeight: '600' }, body: { fontSize: 15, fontWeight: '400' }, sm: { fontSize: 13, fontWeight: '400' },xs: { fontSize: 8, fontWeight: '400' } }; 
export const radius = { sm: 6, md: 12, lg: 20, full: 9999, }; 
export const theme = {    whitetheme,darktheme, spacing, typography, radius , iconSize , Screens};