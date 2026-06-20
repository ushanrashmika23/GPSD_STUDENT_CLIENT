import { useEffect, useState } from "react";

/** Simulates an initial data fetch so skeleton states are exercised. */
export function useLoading(ms = 650) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
