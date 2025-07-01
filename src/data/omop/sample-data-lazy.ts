import { OMOPTableName } from '@/interfaces/observer-omop';

// Lazy loading wrapper for sample data
let sampleDataCache: Record<OMOPTableName, any[]> | null = null;

export const getSampleData = async (): Promise<Record<OMOPTableName, any[]>> => {
  if (sampleDataCache) {
    return sampleDataCache;
  }

  // Dynamically import the sample data only when needed
  const { sampleData } = await import('./sample-data');
  sampleDataCache = sampleData;
  return sampleData;
};

// Helper function to get data for a specific table lazily
export const getSampleDataForTable = async (tableName: OMOPTableName): Promise<any[]> => {
  const data = await getSampleData();
  return data[tableName] || [];
};

// Reset cache (useful for testing or memory management)
export const clearSampleDataCache = (): void => {
  sampleDataCache = null;
};