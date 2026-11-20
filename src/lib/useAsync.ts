import { useCallback, useEffect, useRef, useState } from 'react';

/** Small fetch-state helper with pull-to-refresh support. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const alive = useRef(true);

  const run = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(undefined);
      try {
        const v = await fn();
        if (alive.current) setData(v);
      } catch (e) {
        if (alive.current) setError(e instanceof Error ? e.message : 'Something went wrong.');
      } finally {
        if (alive.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  useEffect(() => {
    alive.current = true;
    run();
    return () => {
      alive.current = false;
    };
  }, [run]);

  return { data, error, loading, refreshing, reload: () => run(false), refresh: () => run(true) };
}
