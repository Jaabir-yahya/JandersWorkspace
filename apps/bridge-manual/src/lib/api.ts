import useSWR, { SWRConfiguration } from "swr";

// Apply Vercel best practices: client-side data fetching deduplication
export function useApiSWR<T = any>(
  key: string,
  fetcher: (url: string) => Promise<T>,
  config?: any,
) {
  return useSWR(key, fetcher, {
    dedupingInterval: 10000, // 10 seconds
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    ...config,
  });
}

// Optimized fetcher with error handling and JSON parsing
export async function apiFetcher<T = any>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(
      `API Error: ${response.status} ${response.statusText}`,
    );
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
}

// Apply Vercel best practice: Promise.all for parallel data fetching
export async function fetchParallel<T1, T2, T3>(
  data1: () => Promise<T1>,
  data2: () => Promise<T2>,
  data3: () => Promise<T3>,
): Promise<{ data1: T1; data2: T2; data3: T3 }> {
  const [result1, result2, result3] = await Promise.all([
    data1(),
    data2(),
    data3(),
  ]);

  return { data1: result1, data2: result2, data3: result3 };
}
