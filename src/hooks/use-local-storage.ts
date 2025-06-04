
import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(prevStoredValue => {
      const newValue = value instanceof Function ? value(prevStoredValue) : value;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
      return newValue;
    });
  }, [key]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    // This effect handles changes to the `key` (e.g., user logs in/out)
    // or if localStorage is updated by another tab/window.
    const item = window.localStorage.getItem(key);
    if (item) {
      const newStoredValue = JSON.parse(item);
      // Only update if the value has actually changed to prevent potential loops
      // with poorly memoized objects/arrays.
      if (JSON.stringify(newStoredValue) !== JSON.stringify(storedValue)) {
        setStoredValue(newStoredValue);
      }
    } else {
      // If the key is new and not in localStorage, initialize state and localStorage.
      // This is important when switching user or first load for a new user.
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        // Also write the initial value to localStorage for the new key
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]); // initialValue should be stable (e.g. from constants or memoized)

  // Secondary effect to handle external localStorage changes for the current key
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        if (event.newValue) {
          setStoredValue(JSON.parse(event.newValue));
        } else {
          // Item was removed or cleared
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]);


  return [storedValue, setValue];
}

export default useLocalStorage;
