import React from "react";
import { AppProviders } from "./providers/AppProviders.jsx";
import Navigation from "./navigation/Navigation.jsx";
import ThemeContextProvider from "../Theme/ThemeContext.jsx";

export const App = () => {
  return (
    <ThemeContextProvider>
    <AppProviders>
      <Navigation />
    </AppProviders>
    </ThemeContextProvider>
  );
};
