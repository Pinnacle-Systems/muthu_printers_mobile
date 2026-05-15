import React from "react";
import { AppProviders } from "./providers/AppProviders.jsx";
import { HomeScreen } from "../screens/HomeScreen.jsx";

export const App = () => {




  return (
    <AppProviders>
      <HomeScreen />
    </AppProviders>
  );
};
