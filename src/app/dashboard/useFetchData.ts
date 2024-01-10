import { useEffect, useState } from 'react';

interface FileType {
  audio: boolean;
  video: boolean;
  transcript: boolean;
  other: boolean;
}

export interface DataType {
  encounter_id: number;
  case: number;
  visit: string;
  department: string;
  files: FileType;
}

export const useFetchData = (url: string) => {
  const [data, setData] = useState<DataType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }
            const data: DataType[] = await res.json();
            setData(data);
        } catch (error: any) {
            setError(error.message);
        }
    };

    fetchData();
  }, [url]);

  return { data, error };
};