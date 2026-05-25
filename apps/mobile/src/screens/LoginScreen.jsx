import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { User, Lock, ArrowRight, UserRoundSearchIcon } from 'lucide-react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton   from '../components/AppButton';
import AppInput    from '../components/AppInput';
import AppCheckbox from '../components/AppCheckbox';
import useThemeProvider from '../Theme/useThemeProvider';
import useUserHooks from '../services/hooks/useUsershooks';
import { logError, logEvent, setUserContext } from '../Utils/crashLogger';
import { APIURL } from '../Utils/Storage/DotenvFinder';
import {accessTokenStorage, createMMKV, refreshTokenStorage, userProfileStorage} from "../Utils/Storage/mmkv"

const LoginScreen = ({ navigation }) => {
  const [username,   setUsername]   = useState('');
  const [password,   setPassword]   = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState({ username: '', password: '' });

  const {AuthundicateApi} = useUserHooks()

  const { current_theme: c, theme } = useThemeProvider();
  const { spacing, typography, radius } = theme;

  



  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    let valid = true;
    const newErrors = { username: '', password: '' };

    if (!username) {
      newErrors.username = 'Username is required';
      valid = false;
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

const handleLogin = async () => {
  if (!validate()) return;
  setLoading(true);

  try {
    logEvent(`Login attempt: ${username}`);

    const auth_api = await AuthundicateApi({ username, password })?.unwrap();
    const { statusCode, message, token, refresh_token, userInfo,finyearId } = auth_api || {};

    if (statusCode == 1) {
      Alert.alert('Login Failed', message || 'Something went wrong');
      return;
    }


   const employee_data =  userInfo?.Employee
    // ── Persist session ──────────────────────────────────────────
    accessTokenStorage.set(token);
    refreshTokenStorage.set(refresh_token ?? token);
   userProfileStorage.set({
  branchId  : employee_data?.branchId,
  companyId : employee_data?.Branch?.companyId,
  userId    : employee_data?.id,
  userName  : employee_data?.name,
  finyearId : finyearId?.id,
  id:       userInfo?.id       || 1001,
  username: userInfo?.username || username,
    });


    //Alert?.alert("data",JSON?.stringify())


    
    // ── Crash logger context ─────────────────────────────────────
    setUserContext({
      id:       userInfo?.id       || 1001,
      username: userInfo?.username || username,
      role:     userInfo?.role     || 'staff',
    });

    logEvent('Login success');
    navigation.navigate('Home');

  } catch (error) {
    logError(error, 'AUTH_ERROR', {
      screen:   'LoginScreen',
      username,
    });
    Alert.alert('Login Failed', JSON?.stringify(error) || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={[styles.safeArea, { backgroundColor: c.background }]}>
      <StatusBar
        barStyle={c.background === '#FFFFFF' ? 'dark-content' : 'light-content'}
        backgroundColor={c.background}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.headerWrapper}>
          <View style={[styles.brandMark, {
            width: 42, height: 42,
            borderRadius: radius.md,
            backgroundColor: c.primary,
          }]}>
            <Text style={[styles.brandText, {
              color: c.background,
              fontSize: typography.h2.fontSize,
            }]}>
              M
            </Text>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Text style={{
              color: c.text,
              fontSize: theme.typography?.h3?.fontSize,
              fontWeight: '600',
            }}>
              Muthu Printers
            </Text>
          </View>
        </View>

        {/* ── CHILD 1 — Top content ──────────────────────────────────────── */}
        <View>

          {/* Sign in heading */}
          <View style={[styles.logoArea, { marginBottom: spacing.xl }]}>
            <Text style={[styles.heading, {
              color: c.text,
              fontSize: typography.h1.fontSize,
            }]}>
              Sign in
            </Text>
            <Text style={[styles.subheading, {
              color: c.textMuted,
              fontSize: typography.sm.fontSize,
            }]}>
              Welcome back to Muthu Printers 
            </Text>
          </View>

          {/* Username */}
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

          {/* Password */}
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

          {/* Forgot password */}
          <TouchableOpacity
            style={[styles.forgotWrap, { marginBottom: spacing.lg }]}
            onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={{ fontSize: typography.sm.fontSize, color: c.textMuted }}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Remember me */}
          <AppCheckbox
            label="Remember me"
            value={rememberMe}
            onChange={setRememberMe}
            style={{ marginBottom: spacing.lg }}
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
        {/* ── END CHILD 1 ────────────────────────────────────────────────── */}

        {/* ── CHILD 2 — Bottom content ───────────────────────────────────── */}
        <View style={styles.signupRow}>
          <Text style={{ fontSize: typography.sm.fontSize, color: c.textMuted }}>
            Don't have an account?{'  '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={{
              fontSize: typography.sm.fontSize,
              color: c.primary,
              fontWeight: '600',
            }}>
              Sign up
            </Text>
          </TouchableOpacity>
        </View>
        {/* ── END CHILD 2 ────────────────────────────────────────────────── */}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea:      { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'space-between' },
  headerWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoArea:      { marginTop: 16 },
  brandMark:     { alignItems: 'center', justifyContent: 'center' },
  brandText:     { fontWeight: '700' },
  heading:       { fontWeight: '700', lineHeight: 32, marginBottom: 5 },
  subheading:    { fontWeight: '300' },
  forgotWrap:    { alignSelf: 'flex-end', marginTop: -8 },
  btnFull:       { width: '100%' },
  signupRow:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});

export default LoginScreen;