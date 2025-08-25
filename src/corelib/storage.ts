import { useMemo } from "react";
import { panic } from "./common";

const alreadyUsedKeys: Set<string> = new Set();

declare const ls_payload: unique symbol;
type StorageKey<T> = string & {
  [ls_payload]: T,
};
export const storageKey = <T>(key: string): StorageKey<T> => {
  if (alreadyUsedKeys.has(key)) return panic(`StorageKey "${key}" already used`);
  return key as StorageKey<T>
};

export const storageGet = <T>(storage: Storage, key: StorageKey<T>) => (): null | T => {
  const data = storage.getItem(key);
  return data ? JSON.parse(data) : null;
};
export const storageSet = <T>(storage: Storage, key: StorageKey<T>) => (item: null | undefined | T): void => {
  if (item == null) {
    storage.removeItem(key)
    return;
  }
  storage.setItem(key, JSON.stringify(item));
}
export const storageUpdate = <T>(storage: Storage, key: StorageKey<T>) => (fn: (storedValue: null | T) => null | undefined | T): void =>
  storageSet(storage, key)(fn(storageGet(storage, key)()));

export const useStorage = <T>(storage: Storage, key: StorageKey<T>) => {
  const controls = useMemo(() => ({
    getItem: storageGet(storage, key),
    setItem: storageSet(storage, key),
    updateItem: storageUpdate(storage, key),
  }), [storage, key]);

  return controls;
}
