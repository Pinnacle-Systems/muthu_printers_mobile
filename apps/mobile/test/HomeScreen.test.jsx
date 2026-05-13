import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { HomeScreen } from "../src/screens/HomeScreen.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { getHealth } = vi.hoisted(() => ({
  getHealth: vi.fn()
}));

vi.mock("@repo/api-client", () => ({
  createApiClient: () => ({
    getHealth
  })
}));

vi.mock("@repo/logger", () => ({
  createLogger: () => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  })
}));

vi.mock("react-native", async () => {
  const ReactNative = await import("react");
  const createComponent = (name) => {
    const Component = ({ children, ...props }) => ReactNative.createElement(name, props, children);
    Component.displayName = name;
    return Component;
  };

  return {
    Pressable: createComponent("Pressable"),
    SafeAreaView: createComponent("SafeAreaView"),
    StyleSheet: {
      create: (styles) => styles
    },
    Text: createComponent("Text"),
    View: createComponent("View")
  };
});

beforeEach(() => {
  getHealth.mockReset();
  vi.spyOn(console, "error").mockImplementation((message, ...args) => {
    if (String(message).includes("react-test-renderer is deprecated")) {
      return;
    }

    console.warn(message, ...args);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("renders API health success state", async () => {
  getHealth.mockResolvedValue({
    service: "api",
    status: "ok",
    timestamp: "2026-05-13T00:00:00.000Z"
  });

  let renderer;

  await act(async () => {
    renderer = TestRenderer.create(<HomeScreen />);
  });

  const tree = renderer.toJSON();
  const text = JSON.stringify(tree);

  expect(getHealth).toHaveBeenCalledTimes(1);
  expect(text).toContain("Muthu Printers");
  expect(text).toContain("ok");
  expect(text).toContain("api");
});
