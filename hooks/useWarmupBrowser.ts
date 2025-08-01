// hooks/useWarmUpBrowser.ts
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

export function useWarmUpBrowser() {
  useEffect(() => {
    void WebBrowser.warmUpAsync();

    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}
