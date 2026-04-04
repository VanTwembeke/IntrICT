export type UserRole = 'admin' | 'user' | 'klant';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone?: string | null;
  company?: string | null;
  vat_number?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  profile_picture_url?: string | null;
  public_username?: string | null;
  customer_number?: number | null;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}
