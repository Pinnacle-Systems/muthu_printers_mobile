// storage/mmkv.js
import { MMKV, useMMKVString, useMMKVBoolean, useMMKVNumber } from "react-native-mmkv";

if (!MMKV) {
  throw new Error(
    "MMKV native module is undefined. " +
    "Ensure the app is rebuilt after installing react-native-mmkv. " +
    "Expo Go is not supported — use a dev build."
  );
}

// ─── Core Instance ───────────────────────────────────────────────
export const storage = new MMKV({
  id: "app-storage",
});

export const createMMKV = (key, defaultValue) => {
  const set = (value) => {
    if (typeof value === "string") storage.set(key, value);
    else if (typeof value === "number") storage.set(key, value);
    else if (typeof value === "boolean") storage.set(key, value);
    else storage.set(key, JSON.stringify(value));
  };

  const get = () => {
    if (typeof defaultValue === "string")
      return storage.getString(key) ?? defaultValue;
    if (typeof defaultValue === "number")
      return storage.getNumber(key) ?? defaultValue;
    if (typeof defaultValue === "boolean")
      return storage.getBoolean(key) ?? defaultValue;

    const raw = storage.getString(key);
    if (!raw) return defaultValue;
    try { return JSON.parse(raw); } catch { return defaultValue; }
  };

  const remove = () => storage.delete(key);
  const exists = () => storage.contains(key);

  return { set, get, remove, exists, key };
};

export const createMMKVStringHook = (key, fallback = "") => () => {
  // v3: pass storage instance as second arg
  const [value, setValue] = useMMKVString(key, storage);
  return {
    value: value ?? fallback,
    set: (v) => setValue(v),
    remove: () => storage.delete(key),
    exists: () => storage.contains(key),
  };
};

export const createMMKVBooleanHook = (key, fallback = false) => () => {
  // v3: pass storage instance as second arg
  const [value, setValue] = useMMKVBoolean(key, storage);
  return {
    value: value ?? fallback,
    set: (v) => setValue(v),
    toggle: () => setValue(!(value ?? fallback)),
    remove: () => storage.delete(key),
    exists: () => storage.contains(key),
  };
};

export const createMMKVNumberHook = (key, fallback = 0) => () => {
  // v3: pass storage instance as second arg
  const [value, setValue] = useMMKVNumber(key, storage);
  return {
    value: value ?? fallback,
    set: (v) => setValue(v),
    increment: (by = 1) => setValue((value ?? fallback) + by),
    decrement: (by = 1) => setValue((value ?? fallback) - by),
    remove: () => storage.delete(key),
    exists: () => storage.contains(key),
  };
};

export const clearAllStorage = () => storage.clearAll();
export const getAllKeys = () => storage.getAllKeys();


export const accessTokenStorage  = createMMKV("access_token",  "");
export const refreshTokenStorage = createMMKV("refresh_token", "");
export const userProfileStorage  = createMMKV("user_profile",  null);


