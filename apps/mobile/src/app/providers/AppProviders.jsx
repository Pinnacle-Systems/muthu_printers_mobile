import React, { createContext } from "react";
import { createMMKVStringHook, userProfileStorage } from "../../Utils/Storage/mmkv";
import { Alert } from "react-native";

export const AuthContext = createContext(null);

const useAccessToken = createMMKVStringHook("access_token", "");

export const AppProviders = ({ children }) => {
  const { value: isToken, set: setToken, remove: removeToken } = useAccessToken();
   const userDetails = userProfileStorage?.get()

  

  return (
    <AuthContext.Provider value={{ isToken, setToken, removeToken , userDetails}}>
      {children}
    </AuthContext.Provider>
  );
};