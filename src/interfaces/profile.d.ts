export interface ProfileData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  date_of_birth: string;
  phone_number: string | null;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  bio: string;
  organization: {
    id: number;
    name: string;
  };
  tier: {
    tier_name: string;
  };
  date_joined: string;
  last_login: string | null;
}
