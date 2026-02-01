/**
 * Network Awareness Hook
 * 
 * Provides network status information for adaptive loading.
 * Reduces data transfer on slow connections.
 * 
 * @example
 * ```tsx
 * function TransactionList() {
 *   const { isSlow, effectiveType } = useNetwork();
 *   const limit = isSlow ? 10 : 50;
 *   
 *   return <TransactionTable limit={limit} />;
 * }
 * ```
 */

'use client';

import { useState, useEffect } from 'react';

interface NetworkState {
  isOnline: boolean;
  isSlow: boolean;
  isFast: boolean;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  saveData: boolean;
}

export function useNetwork(): NetworkState {
  const [state, setState] = useState<NetworkState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlow: false,
    isFast: true,
    effectiveType: '4g',
    saveData: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const connection = (navigator as any).connection;

    const updateNetworkState = () => {
      const effectiveType = connection?.effectiveType || '4g';
      const saveData = connection?.saveData || false;

      setState({
        isOnline: navigator.onLine,
        isSlow: effectiveType === '2g' || effectiveType === 'slow-2g' || saveData,
        isFast: effectiveType === '4g' && !saveData,
        effectiveType,
        saveData,
      });
    };

    // Initial state
    updateNetworkState();

    // Listen for changes
    window.addEventListener('online', updateNetworkState);
    window.addEventListener('offline', updateNetworkState);

    if (connection) {
      connection.addEventListener('change', updateNetworkState);
    }

    return () => {
      window.removeEventListener('online', updateNetworkState);
      window.removeEventListener('offline', updateNetworkState);

      if (connection) {
        connection.removeEventListener('change', updateNetworkState);
      }
    };
  }, []);

  return state;
}

/**
 * Hook to determine optimal data fetch parameters based on network
 */
export function useNetworkAwareFetch() {
  const { isSlow, isFast } = useNetwork();

  return {
    // Reduce page size on slow connections
    pageSize: isSlow ? 10 : isFast ? 50 : 25,
    
    // Disable polling on slow connections
    pollingInterval: isSlow ? 0 : isFast ? 5000 : 10000,
    
    // Skip expensive queries on slow connections
    skipExpensive: isSlow,
    
    // Use smaller images on slow connections
    imageQuality: isSlow ? 'low' : isFast ? 'high' : 'medium',
  };
}
