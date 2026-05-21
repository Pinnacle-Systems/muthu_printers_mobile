import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DummyScreen } from "../../screens/DummyScreen.jsx";
import { HomeScreen } from "../../screens/HomeScreen.jsx";
import LoginScreen from "../../screens/LoginScreen.jsx";
import { KeyboardAvoidingView, Platform } from "react-native";

import {SafeAreaProvider} from "react-native-safe-area-context"
import Pages from "../Pages.js";

const Stack = createNativeStackNavigator();

function Navigation() {

  return (
    <SafeAreaProvider>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS == "android" ? "height" : "padding"} >
    <NavigationContainer>
      <Stack.Navigator  screenOptions={{headerShown:false,  keyboardHandlingEnabled: false}}>
         {
         Pages?.map((p)=>(<Stack.Screen name={p.name} component={p.component} options={p.optional} />))
         }  
      </Stack.Navigator>
    </NavigationContainer>
    </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

export default Navigation;
