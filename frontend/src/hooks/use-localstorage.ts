import { useState } from "react";

const useLocalStorage = <T>(
  key: string
): [T | null, (value: T | null) => void, () => void] => {
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    const prevValue: string | null = window.localStorage.getItem(key);

    return prevValue && JSON.parse(prevValue);
  });

  const setToLocal = (value: T | null) => {
    window.localStorage.setItem(key, JSON.stringify(value));
    setStoredValue(value);
  };

  const removeFromLocal = () => {
    window.localStorage.removeItem(key);
    setStoredValue(null);
  };

  return [storedValue, setToLocal, removeFromLocal];
};

export default useLocalStorage;
