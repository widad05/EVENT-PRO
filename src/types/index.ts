export interface CompanySettings {
  company_name: string;
  slogan_fr: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address_fr: string;
  service_area_fr: string;
  instagram_url: string;
  facebook_url: string;
  currency: string;
  logo_url?: string;
  booking_notice_fr?: string;
  turnstile_enabled?: number;
}

export interface ServiceCategory {
  id: number;
  slug: string;
  name_fr: string;
  name_ar: string;
  description_fr: string;
  sort_order: number;
  is_active: number;
}

export interface ServiceItem {
  id: number;
  category_id: number | null;
  slug: string;
  title_fr: string;
  title_ar: string;
  short_desc_fr: string;
  full_desc_fr: string;
  benefits_json: string;
  included_json: string;
  options_json: string;
  cover_image: string;
  starting_price_mad: number | null;
  price_note_fr: string;
  is_available: number;
  is_featured: number;
  sort_order: number;
}

export interface GalleryImage {
  id: number;
  title_fr: string;
  caption_fr: string;
  category: string;
  image_url: string;
  r2_key?: string;
  sort_order: number;
  is_featured: number;
}

export interface Testimonial {
  id: number;
  client_name: string;
  event_type: string;
  event_date_label: string;
  quote_fr: string;
  rating: number;
  is_demo: number;
}

export interface BookingRecord {
  id: number;
  reference_code: string;
  customer_id: number | null;
  user_id: number | null;
  event_type: string;
  event_title: string;
  event_date: string;
  preferred_time: string;
  event_location: string;
  venue_choice: string;
  guest_count: number;
  event_duration: string;
  estimated_budget: string;
  preferred_style: string;
  color_theme: string;
  special_requirements: string;
  additional_notes: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  preferred_contact: string;
  status: string;
  internal_notes: string;
  assigned_to: string;
  created_at: string;
}

export interface QuoteItem {
  id?: number;
  quote_id?: number;
  description: string;
  quantity: number;
  unit_price_mad: number;
  line_total_mad: number;
}

export interface QuoteRecord {
  id: number;
  reference_code: string;
  booking_id: number | null;
  customer_id: number | null;
  event_type: string;
  event_date: string;
  event_location: string;
  guest_count: number;
  requested_services_json: string;
  budget_range: string;
  details: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  status: string;
  subtotal_mad: number;
  discount_mad: number;
  total_mad: number;
  valid_until: string;
  admin_notes: string;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  admin_reply: string;
  created_at: string;
}

export interface CustomerRecord {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  preferred_contact: string;
  city: string;
  company_name: string;
  notes: string;
  booking_count?: number;
  quote_count?: number;
  created_at: string;
}

export interface ClientNotification {
  id: number;
  title_fr: string;
  message_fr: string;
  link_path: string;
  is_read: number;
  created_at: string;
}

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  whatsapp?: string;
  role: 'client' | 'admin' | 'manager';
}
