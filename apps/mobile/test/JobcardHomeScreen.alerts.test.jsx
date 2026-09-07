import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { beforeEach, expect, test, vi } from "vitest";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  triggerNotifications: vi.fn(),
  useInterval: vi.fn(),
}));

vi.mock("react-native", async () => {
  const ReactModule = await import("react");
  const component =
    (name) =>
    ({ children, ...props }) =>
      ReactModule.createElement(name, props, children);

  return {
    Alert: { alert: vi.fn() },
    Pressable: component("Pressable"),
    RefreshControl: component("RefreshControl"),
    ScrollView: component("ScrollView"),
    StyleSheet: { create: (styles) => styles },
    TouchableOpacity: component("TouchableOpacity"),
    View: component("View"),
  };
});

vi.mock("lucide-react-native", () => ({
  ExternalLink: () => null,
  Pencil: () => null,
  ScanBarcode: () => null,
  X: () => null,
}));

vi.mock("react-native-vector-icons/MaterialIcons", () => ({
  default: () => null,
}));

vi.mock("../src/Theme/useThemeProvider", () => ({
  default: () => ({
    current_theme: {
      background: "#fff",
      border: "#ccc",
      error: "#f00",
      primary: "#00f",
      surface: "#fff",
      text: "#000",
    },
    theme: {
      iconSize: { mxl: 24 },
      radius: { md: 4 },
      Screens: { hp: (value) => value, wp: (value) => value },
      spacing: { md: 8 },
      typography: {},
    },
  }),
}));

vi.mock("../src/components/AppButton.jsx", () => ({ default: () => null }));
vi.mock("../src/components/Text.jsx", () => ({ default: () => null }));
vi.mock("../src/components/AppSearchableDropdown.jsx", () => ({
  default: () => null,
}));
vi.mock("../src/components/AppTable.jsx", () => ({ default: () => null }));
vi.mock("../src/components/QRScanner.jsx", () => ({ default: () => null }));
vi.mock("../src/components/AppModal.jsx", () => ({ default: () => null }));
vi.mock("../src/components/LongRunningMachinesModal.jsx", () => ({
  default: () => null,
}));

vi.mock("../src/services/hooks/useDepartmentHooks.jsx", () => ({
  useDepartmentHooks: () => ({
    getDepartments: {
      data: { data: [] },
      isLoading: false,
      refetch: vi.fn(),
    },
  }),
}));

vi.mock("../src/services/hooks/useJobCardHooks.jsx", () => ({
  useJobCardHooks: () => ({
    getJobCardCompletedList: {
      data: { data: [] },
      isLoading: false,
      refetch: vi.fn(),
    },
    getJobCardList: {
      data: { data: [] },
      isLoading: false,
      refetch: vi.fn(),
    },
  }),
}));

vi.mock("../src/app/providers/AppProviders.jsx", async () => {
  const ReactModule = await import("react");
  return {
    AuthContext: ReactModule.createContext({
      userDetails: { id: 1, roleGroup: "MANAGER" },
    }),
  };
});

vi.mock("react-redux", () => ({ useDispatch: () => vi.fn() }));

vi.mock("../src/redux/api/jobcard.js", () => ({
  default: { util: { invalidateTags: vi.fn() } },
  useGetTakenJobcardQuery: () => ({
    data: undefined,
    error: undefined,
    isError: false,
    isLoading: false,
  }),
}));

vi.mock("../src/redux/api/process.js", () => ({
  useUpdateCurrentProcessMutation: () => [vi.fn()],
}));

vi.mock("../src/Utils/crashLogger.js", () => ({ logError: vi.fn() }));

vi.mock("../src/app/providers/AppModalProvider.jsx", () => ({
  useAppModal: () => ({ showModal: vi.fn(), showWarning: vi.fn() }),
}));

vi.mock("../src/services/hooks/useInterval.jsx", () => ({
  useInterval: mocks.useInterval,
}));

vi.mock("../src/Utils/isWithinWindow.js", () => ({
  isWithinWindow: () => true,
}));

vi.mock("../src/redux/api/machine.js", () => ({
  useLazyGetNotificationMachinesQuery: () => [mocks.triggerNotifications],
  useMarkMachineViewedMutation: () => [vi.fn()],
}));

vi.mock("../src/constant/notificationOfficers.js", () => ({
  allowedNotifiOfficer: ["MANAGER", "ADMIN", "SUPERVISOR"],
}));

import { HomeScreen } from "../src/screens/Jobcard/HomeScreen.jsx";

beforeEach(() => {
  mocks.triggerNotifications.mockReset();
  mocks.triggerNotifications.mockReturnValue({
    unwrap: () => Promise.resolve({ data: [] }),
  });
  mocks.useInterval.mockClear();
});

test("checks for machine alerts immediately when the Home screen mounts", async () => {
  const navigation = {
    addListener: vi.fn(() => vi.fn()),
    navigate: vi.fn(),
  };

  await act(async () => {
    TestRenderer.create(<HomeScreen navigation={navigation} />);
  });

  expect(mocks.triggerNotifications).toHaveBeenCalledTimes(1);
  expect(mocks.useInterval).toHaveBeenCalledWith(
    expect.any(Function),
    60 * 1000,
  );
});
