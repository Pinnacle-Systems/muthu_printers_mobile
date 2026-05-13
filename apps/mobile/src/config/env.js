// Android emulator note:
// - iOS simulator can usually reach your machine with http://localhost:4000.
// - Android emulator maps your host machine to http://10.0.2.2:4000.
// Use the Android URL below when running the API locally from an Android emulator.
export const env = {
  API_BASE_URL: "http://10.0.2.2:4000",
  API_TIMEOUT_MS: 10000
};
