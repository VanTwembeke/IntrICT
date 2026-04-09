export type UserRole = 'admin' | 'user' | 'klant';

export interface PackageRequest {
  id: string;
  user_id: string;
  package_name: string;
  package_price: number;
  status: 'pending' | 'contacted' | 'accepted' | 'rejected';
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  profile?: {
    full_name: string | null;
    email: string;
    company: string | null;
    phone: string | null;
  };
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  color: string;
  highlight: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

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
  show_public_email?: boolean | null;
  show_public_company?: boolean | null;
  show_public_location?: boolean | null;
  show_public_review?: boolean | null;
  review_score?: number | null;
  review_text?: string | null;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}
