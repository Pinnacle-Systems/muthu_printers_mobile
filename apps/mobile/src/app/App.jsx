import React, { useEffect } from "react";
import { AppProviders } from "./providers/AppProviders.jsx";
import Navigation from "./navigation/Navigation.jsx";
import ThemeContextProvider from "../Theme/ThemeContext.jsx";
import { Provider } from "react-redux";
import { StorageConfig } from "../redux/store.js";
import {
  getCrashlytics,
  setCrashlyticsCollectionEnabled,
  setAttributes,
  log,
  recordError,
} from "@react-native-firebase/crashlytics";
import {
  restoreUserContext,
  enableCrashlytics,
} from "../Utils/crashLogger.js";
import { AppModalProvider } from "./providers/AppModalProvider.jsx";

// ✅ Outside component — initialized once
const cl = getCrashlytics();

export const App = () => {

  useEffect(() => {

    // ✅ Enable crashlytics
    enableCrashlytics();

    // ✅ Force enable in dev mode
    if (__DEV__) {
      setCrashlyticsCollectionEnabled(cl, true);
    }

    // ✅ Restore user context from MMKV
    restoreUserContext();

    // ✅ Save previous handler for chaining
    const previousHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error, isFatal) => {
      try {
        // ✅ Use setAttributes (consistent)
        setAttributes(cl, {
          is_fatal: String(isFatal ?? false),
        });
        log(cl, `[GLOBAL_ERROR] ${error?.message ?? 'Unknown error'}`);
        recordError(
          cl,
          error instanceof Error ? error : new Error(error?.message ?? 'Unknown error')
        );
      } catch (crashlyticsError) {
        // Centralized fallback: ensure critical errors are always logged to native stdout/stderr
        // in case Crashlytics fails, so Logcat/Xcode or secondary loggers can capture them.
        console.error('[CRASHLYTICS_FALLBACK] Failed to record global error:', crashlyticsError);
        console.error('[ORIGINAL_ERROR_FALLBACK]', error);
      }

      // ✅ Always call previous handler
      previousHandler?.(error, isFatal);
    });

    // ✅ Cleanup — restore previous handler on unmount
    return () => {
      ErrorUtils.setGlobalHandler(previousHandler);
    };

  }, []);

  return (
    <ThemeContextProvider>
      <Provider store={StorageConfig}>
        <AppProviders>
           <AppModalProvider>
          <Navigation />
          </AppModalProvider>
        </AppProviders>
      </Provider>
    </ThemeContextProvider>
  );
};