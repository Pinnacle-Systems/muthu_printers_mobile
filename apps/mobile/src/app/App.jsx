import React, { useEffect } from "react";
import { AppProviders } from "./providers/AppProviders.jsx";
import Navigation from "./navigation/Navigation.jsx";
import ThemeContextProvider from "../Theme/ThemeContext.jsx";
import {Provider} from  "react-redux" 
import { StorageConfig } from "../redux/store.js";
import { getCrashlytics, setCrashlyticsCollectionEnabled, setAttribute, log, recordError } from '@react-native-firebase/crashlytics';


export const App = () => {

useEffect(()=>{
     const cl = getCrashlytics();
     if (__DEV__) {
    // ✅ force enable in debug mode
      setCrashlyticsCollectionEnabled(cl, true);
     }

  const previousHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      setAttribute(cl, "is_fatal", isFatal.toString());
      log(cl, `[GLOBAL_ERROR] ${error?.message}`);
      recordError(cl, error);
      previousHandler(error, isFatal);
    });

},[])

  return (
    <ThemeContextProvider>
      <Provider store={StorageConfig}>
     <AppProviders>
         <Navigation />
    </AppProviders>
    </Provider>
    </ThemeContextProvider>
  );
};
