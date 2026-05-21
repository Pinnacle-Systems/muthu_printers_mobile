// storage/mmkv.js
import { MMKV } from "react-native-mmkv";
import { useMMKVString, useMMKVBoolean, useMMKVNumber } from "react-native-mmkv";

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
  const [value, setValue] = useMMKVString(key);
  return {
    value: value ?? fallback,
    set: (v) => setValue(v),
    remove: () => storage.delete(key),
    exists: () => storage.contains(key),
  };
};

export const createMMKVBooleanHook = (key, fallback = false) => () => {
  const [value, setValue] = useMMKVBoolean(key);
  return {
    value: value ?? fallback,
    set: (v) => setValue(v),
    toggle: () => setValue(!(value ?? fallback)),
    remove: () => storage.delete(key),
    exists: () => storage.contains(key),
  };
};

export const createMMKVNumberHook = (key, fallback = 0) => () => {
  const [value, setValue] = useMMKVNumber(key);
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