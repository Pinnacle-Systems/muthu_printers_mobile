import {
  getCrashlytics,
  crash,
  log,
  recordError,
  setAttributes,
  setUserId,
  setCrashlyticsCollectionEnabled,
} from '@react-native-firebase/crashlytics';
import { userProfileStorage } from './Storage/mmkv';

const cl = getCrashlytics();

// ─────────────────────────────────────────
// Enable Crashlytics Collection
// ─────────────────────────────────────────
export const enableCrashlytics = () => {
  if (!cl) return;
  setCrashlyticsCollectionEnabled(cl, true);
};

// ─────────────────────────────────────────
// Set User Context (after login)
// ─────────────────────────────────────────
export const setUserContext = (user) => {
  if (!cl || !user) return;

  if (__DEV__) console.log('[CRASHLYTICS] setUserContext:', user);

  // ✅ Save to MMKV for persistence
  //userProfileStorage.set(user);

  setUserId(cl, String(user?.id ?? ''));
  setAttributes(cl, {
    user_name: String(user?.username ?? 'unknown'),
    user_role: String(user?.role     ?? 'staff'),
  });
};

// ─────────────────────────────────────────
// Restore User Context (on app start)
// ─────────────────────────────────────────
export const restoreUserContext = () => {
  if (!cl) return;

  try {
    const user = userProfileStorage.get(); // ✅ Read from MMKV (sync)
    if (!user || !user.id) return;

    if (__DEV__) console.log('[CRASHLYTICS] restoreUserContext:', user);

    setUserId(cl, String(user?.id ?? ''));
    setAttributes(cl, {
      user_name: String(user?.username ?? 'unknown'),
      user_role: String(user?.role     ?? 'staff'),
    });
  } catch (error) {
    if (__DEV__) console.error('[CRASHLYTICS] restoreUserContext failed:', error);
  }
};

// ─────────────────────────────────────────
// Clear User Context (after logout)
// ─────────────────────────────────────────
export const clearUserContext = () => {
  if (!cl) return;

  if (__DEV__) console.log('[CRASHLYTICS] clearUserContext');

  // ✅ Remove from MMKV
  userProfileStorage.remove();

  setUserId(cl, '');
  setAttributes(cl, {
    user_name: 'logged_out',
    user_role: 'none',
  });
};

// ─────────────────────────────────────────
// Log Error (main function)
// ─────────────────────────────────────────
export const logError = (modulename, functionname, category, error, extra = {}) => {
  if (!cl) return;

  if (__DEV__) {
    console.error(
      `[CRASHLYTICS ERROR] [${category}] [${modulename}:${functionname}]`,
      error?.message ?? error,
      extra
    );
  }

  const attributes = {
    error_category : String(category     ?? ''),
    error_module   : String(modulename   ?? ''),
    error_function : String(functionname ?? ''),
    ...Object.fromEntries(
      Object.entries(extra).map(([k, v]) => [k, String(v ?? '')])
    ),
  };

  setAttributes(cl, attributes);

  let errorMessage;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null) {
    errorMessage =
      error.data?.message ||
      error.error         ||
      error.message       ||
      JSON.stringify(error);
  } else {
    errorMessage = String(error ?? 'Unknown error');
  }

  log(cl, `[${category}] [${modulename}:${functionname}] ${errorMessage}`);

  recordError(
    cl,
    error instanceof Error ? error : new Error(errorMessage)
  );
};

// ─────────────────────────────────────────
// Log Simple Event / Message
// ─────────────────────────────────────────
export const logEvent = (message) => {
  if (!cl) return;

  if (__DEV__) console.log(`[CRASHLYTICS LOG] ${message}`);

  log(cl, String(message ?? ''));
};

// ─────────────────────────────────────────
// Test Crash (dev only)
// ─────────────────────────────────────────
export const testCrash = () => {
  if (!cl) return;

  if (__DEV__) {
    console.warn('[CRASHLYTICS] testCrash triggered!');
    crash(cl);
  } else {
    console.warn('[CRASHLYTICS] testCrash blocked in production!');
  }
};