export interface ProviderDataType {
  id: number;
  provider_id: number;
  year_of_birth: string | null;
  sex: string;
  race: string;
  ethnicity: string;
}

export interface PublicProviderDataType {
  id: number;
  year_of_birth: string | null;
  sex: string;
  race: string;
  ethnicity: string;
}

// Provider interface from encounter.ts
export interface Provider {
  id: number;
  name: string;
  specialty?: string;
}
