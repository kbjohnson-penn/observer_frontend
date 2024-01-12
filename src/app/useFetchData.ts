import { useEffect, useState } from "react";

export const useFetchData = <T,>(url: string) => {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${res.status}`
          );
        }
        const data: T[] = await res.json();
        setData(data);
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchData();
  }, [url]);

  return { data, error };
};