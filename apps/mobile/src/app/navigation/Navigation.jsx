import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DummyScreen } from "../../screens/DummyScreen.jsx";
import { HomeScreen } from "../../screens/HomeScreen.jsx";
import LoginScreen from "../../screens/LoginScreen.jsx";
import { KeyboardAvoidingView, Platform } from "react-native";

import {SafeAreaProvider} from "react-native-safe-area-context"

const Stack = createNativeStackNavigator();

function Navigation() {
  return (
    <SafeAreaProvider>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS == "android" ? "height" : "padding"} >
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LOGIN" screenOptions={{headerShown:false,  keyboardHandlingEnabled: false}}>
        <Stack.Screen name="LOGIN" component={LoginScreen} options={{ title: "Login" }} />
      </Stack.Navigator>
    </NavigationContainer>
    </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

export default Navigation;
