import React, { useState, useContext } from 'react';
import { AuthContext } from '../app/providers/AppProviders.jsx';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { User, Lock, ArrowRight } from 'lucide-react-native';
import AppButton   from '../components/AppButton';
import AppInput    from '../components/AppInput';
import AppCheckbox from '../components/AppCheckbox';
import useThemeProvider from '../Theme/useThemeProvider';
import useUserHooks from '../services/hooks/useUsershooks';
import { logError, logEvent, setUserContext } from '../Utils/crashLogger';
import {
  accessTokenStorage,
  refreshTokenStorage,
  userProfileStorage,
} from '../Utils/Storage/mmkv';

// ── Geometric background shapes (pure View, no library) ───────────────────────
const BackgroundDecor = ({ primaryColor }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">

    {/* Large circle — top right */}
    <View style={[
      styles.decor,
      {
        width           : 280,
        height          : 280,
        borderRadius    : 140,
        backgroundColor : primaryColor,
        opacity         : 0.07,
        top             : -80,
        right           : -80,
      },
    ]} />

    {/* Medium circle — top right (ring outline) */}
    <View style={[
      styles.decor,
      {
        width        : 180,
        height       : 180,
        borderRadius : 90,
        borderWidth  : 1.5,
        borderColor  : primaryColor,
        opacity      : 0.10,
        top          : -20,
        right        : 40,
      },
    ]} />

    {/* Small filled circle — bottom left */}
    <View style={[
      styles.decor,
      {
        width           : 160,
        height          : 160,
        borderRadius    : 80,
        backgroundColor : primaryColor,
        opacity         : 0.06,
        bottom          : 60,
        left            : -60,
      },
    ]} />

    {/* Tiny dot — bottom left accent */}
    <View style={[
      styles.decor,
      {
        width           : 60,
        height          : 60,
        borderRadius    : 30,
        backgroundColor : primaryColor,
        opacity         : 0.12,
        bottom          : 140,
        left            : 60,
      },
    ]} />

    {/* Horizontal rule stripe — middle */}
    <View style={[
      styles.decor,
      {
        width           : '60%',
        height          : 1,
        backgroundColor : primaryColor,
        opacity         : 0.08,
        top             : '42%',
        left            : '-5%',
        transform       : [{ rotate: '-8deg' }],
      },
    ]} />

    {/* Second stripe */}
    <View style={[
      styles.decor,
      {
        width           : '40%',
        height          : 1,
        backgroundColor : primaryColor,
        opacity         : 0.06,
        top             : '45%',
        left            : '-5%',
        transform       : [{ rotate: '-8deg' }],
      },
    ]} />

    {/* Square rotated — bottom right */}
    <View style={[
      styles.decor,
      {
        width           : 90,
        height          : 90,
        backgroundColor : primaryColor,
        opacity         : 0.05,
        bottom          : 80,
        right           : -30,
        transform       : [{ rotate: '30deg' }],
      },
    ]} />

    {/* Square outline — bottom right */}
    <View style={[
      styles.decor,
      {
        width        : 60,
        height       : 60,
        borderWidth  : 1.5,
        borderColor  : primaryColor,
        opacity      : 0.10,
        bottom       : 110,
        right        : 40,
        transform    : [{ rotate: '30deg' }],
      },
    ]} />

  </View>
);

// ─────────────────────────────────────────────────────────────────────────────

const LoginScreen = ({ navigation }) => {
  const { setToken } = useContext(AuthContext);
  const [username,   setUsername]   = useState('');
  const [password,   setPassword]   = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState({ username: '', password: '' });

  const { authenticateApi } = useUserHooks();
  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, typography, radius } = theme;

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    let valid = true;
    const newErrors = { username: '', password: '' };
    if (!username) {
      newErrors.username = 'Username is required';
      valid = false;
    } 
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } 
    setErrors(newErrors);
    return valid;
  };

  // ── Login Handler ──────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      logEvent(`Login attempt: ${username}`);

      const auth_api = await authenticateApi({ username, password })?.unwrap();
      const { statusCode, message, token, refresh_token, userInfo, finyearId } = auth_api || {};

      if (statusCode == 1) {
        Alert.alert('Login Failed', message || 'Something went wrong');
        return;
      }

      const employee_data = userInfo?.Employee;

      refreshTokenStorage.set(refresh_token ?? token);
      userProfileStorage.set({
        branchId  : employee_data?.branchId,
        companyId : employee_data?.Branch?.companyId,
        userId    : employee_data?.id,
        userName  : employee_data?.name,
        finyearId : finyearId?.id,
        id        : userInfo?.id       || 1001,
        username  : userInfo?.username || username,
      });

      setUserContext({
        id       : userInfo?.id       || 1001,
        username : userInfo?.username || username,
        role     : userInfo?.role     || 'staff',
      });

      // Crucial Fix: Set the token state LAST. 
      // This triggers the React state re-render that swaps the navigation stack to the App stack.
      // Doing this last ensures userProfileStorage is fully populated when the new stack mounts.
      setToken(token); 

      logEvent('Login success');
      // Manual navigation removed: App.jsx handles the stack swap automatically when isToken evaluates to true

    } catch (error) {
      logError('LOGIN', 'Handle Login', 'AUTH', 'AUTH_ERROR', {
        screen: 'LoginScreen',
        username,
      });
      Alert.alert('Login Failed',  'Login failed please try again!');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <StatusBar
        barStyle={c.background === '#FFFFFF' ? 'dark-content' : 'light-content'}
        backgroundColor={c.background}
      />

      {/* Decorative background */}
      <BackgroundDecor primaryColor={c.primary} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topSection, { paddingHorizontal: spacing.xl }]}>

          {/* Brand header */}
          <View style={styles.brandRow}>
            <Image
              source={{ uri: 'https://muthuprinters.org/wp-content/uploads/2026/02/cropped-Muthu-Printer-Logo-500x500-1-e1770314919977.png' }}
              style={[styles.brandMark, { borderRadius: radius.md }]}
              resizeMode="contain"
            />
            <Text style={[styles.brandName, { color: c.text, fontSize: typography.h2?.fontSize }]}>
              Muthu Printers
            </Text>
          </View>

          {/* Card wrapper */}
          <View style={[
            styles.card,
            {
              backgroundColor : c.background,
              borderRadius    : radius.lg ?? 20,
              borderColor     : c.border ?? `${c.primary}22`,
            },
          ]}>

            {/* Page heading */}
            <View style={styles.headingBlock}>
              <Text style={[styles.heading, { color: c.text, fontSize: typography.h1?.fontSize }]}>
                Sign in
              </Text>
              <Text style={[styles.subheading, { color: c.textMuted, fontSize: typography.sm?.fontSize }]}>
                Welcome back to Muthu Printers
              </Text>
            </View>

            {/* Inputs */}
            <View style={styles.fieldGroup}>
              <AppInput
                placeholder="Enter Your Username"
                leftIcon={User}
                value={username}
                onChangeText={text => {
                  setUsername(text);
                  setErrors(e => ({ ...e, username: '' }));
                }}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.username}
              />
              <AppInput
                placeholder="Password"
                leftIcon={Lock}
                isPassword
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  setErrors(e => ({ ...e, password: '' }));
                }}
                error={errors.password}
              />
            </View>

            {/* Remember me */}
            <AppCheckbox
              label="Remember me"
              value={rememberMe}
              onChange={setRememberMe}
              style={styles.checkbox}
            />

            {/* Sign in button */}
            <AppButton
              label="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="md"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              style={styles.btnFull}
            />

          </View>
          {/* END card */}

          {/* Footer */}
          <Text style={[styles.footerText, { color: c.textMuted, fontSize: typography.sm?.fontSize }]}>
            © 2026 Pinnacle Systems. All rights reserved.
          </Text>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow       : 1,
    justifyContent : 'center',
    paddingVertical: 32,
  },

  // ── Background decor
  decor: {
    position: 'absolute',
  },

  // ── Top section
  topSection: {
    // no paddingTop — scroll handles it
  },

  // ── Brand
  brandRow: {
    flexDirection : 'row',
    alignItems    : 'center',
    gap           : 10,
    marginBottom  : 24,
    marginLeft:10
  },
  brandMark: {
    width          : 80,
    height         : 80,
    alignItems     : 'center',
    justifyContent : 'center',
  },
  brandLetter: {
    fontSize   : 20,
    fontWeight : '700',
  },
  brandName: {
    fontWeight : '600',
  },

  // ── Card
  card: {
    padding      : 24,
    borderWidth  : 1,
    shadowColor  : '#000',
    shadowOffset : { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius : 16,
    elevation    : 4,
    marginBottom : 24,
  },

  // ── Heading
  headingBlock: {
    marginBottom: 24,
  },
  heading: {
    fontWeight   : '700',
    lineHeight   : 36,
    marginBottom : 4,
  },
  subheading: {
    fontWeight: '300',
  },

  // ── Fields
  fieldGroup: {
    gap          : 12,
    marginBottom : 16,
  },

  // ── Checkbox
  checkbox: {
    marginBottom: 24,
  },

  // ── Button
  btnFull: {
    width: '100%',
  },

  // ── Footer
  footerText: {
    textAlign: 'center',
  },
});

export default LoginScreen;