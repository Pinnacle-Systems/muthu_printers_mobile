import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DummyScreen } from "../../screens/DummyScreen.jsx";
import { HomeScreen } from "../../screens/Jobcard/HomeScreen.jsx";
import LoginScreen from "../../screens/LoginScreen.jsx";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";

import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context"
import Pages from "../Pages.js";
import { AuthContext } from "../providers/AppProviders.jsx";

const Stack = createNativeStackNavigator();

function Navigation() {

  const {isToken} = useContext(AuthContext)




  return (
    <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS == "android" ? "height" : "padding"} >
    <NavigationContainer>
      <Stack.Navigator  screenOptions={{headerShown:false,  keyboardHandlingEnabled: false}} initialRouteName={!isToken ? "LOGIN" : "HOME"}>
         {
         !isToken ? <Stack.Screen name={"LOGIN"} component={LoginScreen} options={{ title: "Home" }} /> :   Pages?.map((p)=>(<Stack.Screen name={p.name} component={p.component} options={p.optional} />))
         }  
      </Stack.Navigator>
    </NavigationContainer>
    </KeyboardAvoidingView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default Navigation;
