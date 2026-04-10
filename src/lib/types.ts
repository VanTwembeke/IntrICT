export type UserRole = 'admin' | 'user' | 'klant';

export interface AppointmentType {
  id: string;
  name: string;
  duration_minutes: number;
  description: string | null;
  requires_package: boolean;
  max_per_user: number | null;
  color: string;
  active: boolean;
  sort_order: number;
}

export interface WorkingHour {
  day_of_week: number; // 0=Sun … 6=Sat
  start_time: string;  // 'HH:MM'
  end_time: string;
  is_active: boolean;
  break_start: string | null;
  break_end: string | null;
}

export interface Appointment {
  id: string;
  user_id: string;
  appointment_type_id: string | null;
  type_name: string;
  duration_minutes: number;
  starts_at: string;
  ends_at: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes: string | null;
  admin_notes: string | null;
  meeting_link: string | null;
  location: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  // joined
  profile?: {
    full_name: string | null;
    email: string;
  };
}

export interface TimeLog {
  id: string;
  user_id: string;
  logged_date: string;
  duration_minutes: number;
  description: string | null;
  billable: boolean;
  created_at: string;
  // joined
  profile?: {
    full_name: string | null;
    email: string;
  };
}

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
