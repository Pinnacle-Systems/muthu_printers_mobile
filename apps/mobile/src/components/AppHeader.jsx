import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import useThemeProvider from '../Theme/useThemeProvider';
import { clearAllStorage } from '../Utils/Storage/mmkv';

/**
 * AppHeader — Fully reusable custom header
 *
 * Props:
 *  title           - header title string
 *  subtitle        - smaller text below title (optional)
 *  showBack        - show back arrow; auto-detects from stack if omitted
 *  onBackPress     - override default goBack()
 *  leftIcon        - lucide icon component replacing back arrow
 *  onLeftPress     - press handler for leftIcon
 *  rightIcons      - array of:
 *                    {
 *                      key: string,         // unique key (required)
 *                      icon: LucideIcon,    // lucide-react-native component
 *                      onPress: () => void,
 *                      badge?: number,      // shows red dot; 0 = hidden
 *                      disabled?: boolean,
 *                    }
 *  centerTitle     - center the title (default: true)
 *  borderless      - hide bottom border (default: false)
 *  elevated        - add shadow below header (default: false)
 *  backgroundColor - override header background color
 *  tintColor       - override icon + title color
 *  titleStyle      - extra TextStyle for title
 *  containerStyle  - extra style for outer wrapper
 *
 * Usage — Option A (inside screen JSX):
 *   <AppHeader title="Home" rightIcons={[{ key:'bell', icon: Bell, onPress: () => {}, badge: 3 }]} />
 *
 * Usage — Option B (React Navigation header prop in Pages.js):
 *   options: {
 *     header: () => <AppHeader title="Home" rightIcons={[...]} />
 *   }
 */

const ICON_SIZE    = 22;
const HEADER_HEIGHT = 52;
const SIDE_WIDTH   = 80; // fixed width for left/right slots keeps title centered

const AppHeader = ({
  title,
  subtitle,
  showBack,
  onBackPress,
  leftIcon: LeftIcon,
  onLeftPress,
  rightIcons = [],
  centerTitle = true,
  borderless = false,
  elevated = false,
  backgroundColor,
  tintColor,
  titleStyle,
  containerStyle,
}) => {
  const navigation = useNavigation();
  const { current_theme: c, theme ,setthememode,thememode } = useThemeProvider();
  const { typography, spacing } = theme;

  const canGoBack   = navigation.canGoBack();
  const displayBack = showBack !== undefined ? showBack : canGoBack;
  const bgColor     = backgroundColor ?? c.surface ?? c.background;
  const iconColor   = tintColor ?? c.text;

  // ── Status bar style ────────────────────────────────────────────────────
  const isDark = bgColor === '#000000' || bgColor?.toLowerCase()?.includes('dark');
  const barStyle = isDark ? 'light-content' : 'dark-content';

  const handleBack = () => {
    if (onBackPress) { onBackPress(); return; }
    if (navigation.canGoBack()) navigation.goBack();
  };

  // ── Left slot ────────────────────────────────────────────────────────────
  const renderLeft = () => {
    if (LeftIcon) {
      return (
        <TouchableOpacity
          onPress={onLeftPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.sideSlot}>
          <LeftIcon size={ICON_SIZE} color={iconColor} />
        </TouchableOpacity>
      );
    }
    if (displayBack) {
      return (
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.sideSlot}>
          <ChevronLeft size={ICON_SIZE + 2} color={iconColor} />
        </TouchableOpacity>
      );
    }
    // empty placeholder — keeps title centered
    return <View style={styles.sideSlot} />;
  };

  function themechangefun(){
    if(String(thememode)  === "white"){
           setthememode("dark")
    }else{
          setthememode("white")
    }
  }

  function logoutFun(){

    Alert?.alert("Logout","Do You Want Logout ? ",[{text:"cancel"},{text:"Logout",onPress:()=>{
     clearAllStorage()
    navigation?.navigate("LOGIN")
    }}])
    
    
  }

  // ── Right slot ───────────────────────────────────────────────────────────
  const renderRight = () => (
    <View style={[styles.sideSlot, styles.rightGroup]}>
      {rightIcons.map(item => {
        const Icon =  item?.theme ?   String(thememode) === "white" ?  item.icon["dark"] : item.icon["white"] : item?.icon;
        const hasBadge = item.badge !== undefined && item.badge > 0;
        return (
          <TouchableOpacity
            key={item.key}
            onPress={item?.theme?.change ? themechangefun : item?.logout ?  logoutFun :  item.onPress}
            disabled={item.disabled}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
            style={[styles.rightIconBtn, item.disabled && { opacity: 0.4 }]}>
            <Icon size={ICON_SIZE} color={iconColor} />
            {hasBadge && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: c.error ?? '#E53935' },
                ]}>
                <Text style={styles.badgeText}>
                  {item.badge > 99 ? '99+' : item.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── Title slot ───────────────────────────────────────────────────────────
  const renderTitle = () => (
    <View
      style={[
        styles.titleSlot,
        centerTitle && styles.titleCenter,
      ]}>
      {!!title && (
        <Text
          numberOfLines={1}
          style={[
            styles.titleText,
            {
              fontSize:   typography.body?.fontSize   ?? 16,
              color:      iconColor,
              textAlign:  centerTitle ? 'center' : 'left',
            },
            titleStyle,
          ]}>
          {title}
        </Text>
      )}
      {!!subtitle && (
        <Text
          numberOfLines={1}
          style={[
            styles.subtitleText,
            {
              fontSize: typography.sm?.fontSize ?? 12,
              color:    c.textMuted,
              textAlign: centerTitle ? 'center' : 'left',
            },
          ]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  return (
    <>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={bgColor}
        translucent={false}
      />
      <View
        style={[
          styles.outerWrap,
          {
            backgroundColor: bgColor,
          },
          !borderless && {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: c.border,
          },
          elevated && styles.elevated,
          containerStyle,
        ]}>
        <View style={styles.headerRow}>
          {renderLeft()}
          {renderTitle()}
          {renderRight()}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerWrap: {
    width: '100%',
  },
  headerRow: {
    height:         HEADER_HEIGHT,
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 4,
  },
  // ── Left / Right fixed-width slots ──────────────────────────────────────
  sideSlot: {
    width:          SIDE_WIDTH,
    justifyContent: 'center',
  },
  rightGroup: {
    flexDirection:  'row',
    justifyContent: 'flex-end',
    alignItems:     'center',
    
  },
  rightIconBtn: {
    marginLeft:  4,
    padding:     6,
    position:    'relative',
  },
  // ── Title ───────────────────────────────────────────────────────────────
  titleSlot: {
    flex:           1,
    justifyContent: 'center',
  },
  titleCenter: {
    alignItems: 'center',
  },
  titleText: {
    fontWeight: '600',
  },
  subtitleText: {
    fontWeight: '400',
    marginTop:  1,
  },
  // ── Badge ───────────────────────────────────────────────────────────────
  badge: {
    position:     'absolute',
    top:          2,
    right:        2,
    minWidth:     16,
    height:       16,
    borderRadius: 8,
    alignItems:   'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color:      '#FFFFFF',
    fontSize:   9,
    fontWeight: '700',
    lineHeight: 12,
  },
  // ── Elevation ───────────────────────────────────────────────────────────
  elevated: {
    elevation: 4,
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius:  4,
  },
});

export default AppHeader;