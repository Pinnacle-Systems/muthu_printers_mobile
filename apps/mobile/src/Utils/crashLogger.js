import {
  getCrashlytics,
  crash,
  log,
  recordError,
  setAttribute,
  setAttributes,
  setUserId,
  setCrashlyticsCollectionEnabled,
} from '@react-native-firebase/crashlytics';

const cl = getCrashlytics();


export const enableCrashlytics = () => {
  setCrashlyticsCollectionEnabled(cl, true);
};


export const setUserContext = (user) => {
  // if (__DEV__) console.log('[USER]', user);
  setUserId(cl, user.id.toString());
  setAttributes(cl, {
    user_name:   user.username || 'unknown',
    user_role:   user.role     || 'staff',
  });
};


export const clearUserContext = () => {
  setUserId(cl, '');
  setAttributes(cl, {
    user_name: 'logged_out',
    user_role: 'none',
  });
};


export const logError = (error, category, extra = {}) => {
  // if (__DEV__) console.error(`[${category}]`, error?.message, extra);
  setAttribute(cl, 'error_category', category);
  setAttributes(cl,
    Object.fromEntries(
      Object.entries(extra).map(([k, v]) => [k, String(v)])
    )
  );
  
  let errorMessage;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null) {
    errorMessage = error.data?.message || error.error || error.message || JSON.stringify(error);
  } else {
    errorMessage = String(error);
  }

  log(cl, `[${category}] ${errorMessage}`);
  recordError(cl,
    error instanceof Error ? error : new Error(errorMessage)
  );
};


export const logEvent = (message) => {
  // if (__DEV__) console.log(`[LOG] ${message}`);
  log(cl, message);
};


export const testCrash = () => crash(cl);