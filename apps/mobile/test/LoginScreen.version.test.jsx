import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { expect, test, vi } from "vitest";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("react-native", async () => {
  const ReactModule = await import("react");
  const component =
    (name) =>
    ({ children, ...props }) =>
      ReactModule.createElement(name, props, children);

  return {
    Alert: { alert: vi.fn() },
    Image: component("Image"),
    ScrollView: component("ScrollView"),
    StatusBar: component("StatusBar"),
    StyleSheet: {
      absoluteFill: {},
      create: (styles) => styles,
    },
    Text: component("Text"),
    View: component("View"),
  };
});

vi.mock("lucide-react-native", () => ({
  ArrowRight: () => null,
  Lock: () => null,
  User: () => null,
}));

vi.mock("../src/app/providers/AppProviders.jsx", async () => {
  const ReactModule = await import("react");
  return {
    AuthContext: ReactModule.createContext({ setToken: vi.fn() }),
  };
});

vi.mock("../src/components/AppButton", () => ({ default: () => null }));
vi.mock("../src/components/AppInput", () => ({ default: () => null }));
vi.mock("../src/components/AppCheckbox", () => ({ default: () => null }));

vi.mock("../src/Theme/useThemeProvider", () => ({
  default: () => ({
    current_theme: {
      background: "#fff",
      border: "#ccc",
      primary: "#00f",
      text: "#000",
      textMuted: "#777",
    },
    theme: {
      radius: { lg: 20, md: 8 },
      spacing: { xl: 24 },
      typography: {
        h1: { fontSize: 32 },
        h2: { fontSize: 24 },
        sm: { fontSize: 14 },
      },
    },
  }),
}));

vi.mock("../src/services/hooks/useUsershooks", () => ({
  default: () => ({ authenticateApi: vi.fn() }),
}));

vi.mock("../src/Utils/crashLogger", () => ({
  logError: vi.fn(),
  logEvent: vi.fn(),
  setUserContext: vi.fn(),
}));

vi.mock("../src/Utils/Storage/mmkv", () => ({
  accessTokenStorage: { set: vi.fn() },
  refreshTokenStorage: { set: vi.fn() },
  userProfileStorage: { set: vi.fn() },
}));

import LoginScreen from "../src/screens/LoginScreen.jsx";

test("displays version 1.0 above the Login screen copyright", async () => {
  let renderer;

  await act(async () => {
    renderer = TestRenderer.create(<LoginScreen navigation={{}} />);
  });

  const renderedText = renderer.root
    .findAllByType("Text")
    .map((node) => node.children.join(""));

  expect(renderedText).toContain("Version: 1.0");
  expect(renderedText.indexOf("Version: 1.0")).toBeLessThan(
    renderedText.findIndex((text) => text.includes("Pinnacle Systems")),
  );
});
