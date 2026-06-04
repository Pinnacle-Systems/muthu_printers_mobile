import React, { useContext, useEffect, useRef, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DummyScreen } from "../../screens/DummyScreen.jsx";
import { HomeScreen } from "../../screens/Jobcard/HomeScreen.jsx";
import LoginScreen from "../../screens/LoginScreen.jsx";
import { Alert, KeyboardAvoidingView, Platform, View, PanResponder } from "react-native";
import { clearAllStorage } from "../../Utils/Storage/mmkv";

import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context"
import Pages from "../Pages.js";
import { AuthContext } from "../providers/AppProviders.jsx";

const Stack = createNativeStackNavigator();

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function Navigation() {

  const { isToken, removeToken } = useContext(AuthContext);
  const timerRef = useRef(null);

  const handleAutoLogout = useCallback(() => {
    clearAllStorage();
    if (removeToken) removeToken();
    Alert.alert("Session Expired", "You have been logged out due to inactivity.");
  }, [removeToken]);

  const resetInactivityTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isToken) {
      timerRef.current = setTimeout(() => {
        handleAutoLogout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [isToken, handleAutoLogout]);

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resetInactivityTimer]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetInactivityTimer();
        return false; // Do not block touches
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetInactivityTimer();
        return false;
      },
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => false,
    })
  ).current;

  return (
    <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === "android" ? "height" : "padding"} >
    <NavigationContainer>
      <Stack.Navigator  screenOptions={{headerShown:false,  keyboardHandlingEnabled: false}} initialRouteName={!isToken ? "LOGIN" : "HOME"}>
         {
         !isToken ? <Stack.Screen name={"LOGIN"} component={LoginScreen} options={{ title: "Home" }} /> :   Pages?.map((p)=>(<Stack.Screen name={p.name} component={p.component} options={p.optional} />))
         }  
      </Stack.Navigator>
    </NavigationContainer>
    </KeyboardAvoidingView>
    </View>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default Navigation;
