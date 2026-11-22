-- EVENT PRO — Cloudflare D1 (SQLite) Relational Schema
-- Migration 0001: Initial schema for event planning, bookings, quotes, gallery, auth & settings

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin', 'manager')),
  is_active INTEGER NOT NULL DEFAULT 1,
  reset_token_hash TEXT,
  reset_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'admin', 'manager')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

CREATE TABLE IF NOT EXISTS admin_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  role_name TEXT NOT NULL DEFAULT 'Super Administrateur',
  permissions_json TEXT NOT NULL DEFAULT '["all"]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  whatsapp TEXT DEFAULT '',
  preferred_contact TEXT NOT NULL DEFAULT 'whatsapp' CHECK (preferred_contact IN ('whatsapp', 'telephone', 'email')),
  city TEXT NOT NULL DEFAULT 'Casablanca',
  company_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

CREATE TABLE IF NOT EXISTS service_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name_fr TEXT NOT NULL,
  name_ar TEXT DEFAULT '',
  description_fr TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  slug TEXT NOT NULL UNIQUE,
  title_fr TEXT NOT NULL,
  title_ar TEXT DEFAULT '',
  short_desc_fr TEXT NOT NULL,
  full_desc_fr TEXT NOT NULL,
  benefits_json TEXT NOT NULL DEFAULT '[]',
  included_json TEXT NOT NULL DEFAULT '[]',
  options_json TEXT NOT NULL DEFAULT '[]',
  cover_image TEXT NOT NULL DEFAULT '',
  starting_price_mad INTEGER,
  price_note_fr TEXT NOT NULL DEFAULT 'Tarif sur devis',
  is_available INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_available ON services(is_available);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_code TEXT NOT NULL UNIQUE,
  customer_id INTEGER,
  user_id INTEGER,
  event_type TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  preferred_time TEXT DEFAULT '',
  event_location TEXT NOT NULL,
  venue_choice TEXT DEFAULT '',
  guest_count INTEGER NOT NULL DEFAULT 50,
  event_duration TEXT DEFAULT '',
  estimated_budget TEXT NOT NULL,
  preferred_style TEXT DEFAULT '',
  color_theme TEXT DEFAULT '',
  special_requirements TEXT DEFAULT '',
  additional_notes TEXT DEFAULT '',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT DEFAULT '',
  preferred_contact TEXT NOT NULL DEFAULT 'whatsapp' CHECK (preferred_contact IN ('whatsapp', 'telephone', 'email')),
  status TEXT NOT NULL DEFAULT 'Nouvelle demande' CHECK (
    status IN ('Nouvelle demande', 'En cours d''étude', 'Devis envoyé', 'Confirmé', 'Terminé', 'Annulé')
  ),
  internal_notes TEXT DEFAULT '',
  assigned_to TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);

CREATE TABLE IF NOT EXISTS booking_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  service_id INTEGER,
  service_name TEXT NOT NULL,
  selected_options_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_booking_services_booking ON booking_services(booking_id);

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_code TEXT NOT NULL UNIQUE,
  booking_id INTEGER,
  customer_id INTEGER,
  user_id INTEGER,
  event_type TEXT NOT NULL,
  event_date TEXT DEFAULT '',
  event_location TEXT NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 50,
  requested_services_json TEXT NOT NULL DEFAULT '[]',
  budget_range TEXT NOT NULL,
  details TEXT DEFAULT '',
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Nouvelle demande' CHECK (
    status IN ('Nouvelle demande', 'En cours', 'Devis envoyé', 'En attente du client', 'Accepté', 'Refusé', 'Annulé')
  ),
  subtotal_mad INTEGER NOT NULL DEFAULT 0,
  discount_mad INTEGER NOT NULL DEFAULT 0,
  total_mad INTEGER NOT NULL DEFAULT 0,
  valid_until TEXT DEFAULT '',
  admin_notes TEXT DEFAULT '',
  pdf_ready_data TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(client_email);

CREATE TABLE IF NOT EXISTS quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  service_id INTEGER,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_mad INTEGER NOT NULL DEFAULT 0,
  line_total_mad INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  admin_reply TEXT DEFAULT '',
  replied_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);

CREATE TABLE IF NOT EXISTS gallery_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_fr TEXT NOT NULL,
  caption_fr TEXT DEFAULT '',
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  r2_key TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date_label TEXT DEFAULT '',
  quote_fr TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  is_demo INTEGER NOT NULL DEFAULT 1,
  is_published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title_fr TEXT NOT NULL,
  message_fr TEXT NOT NULL,
  link_path TEXT DEFAULT '/client',
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS company_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  company_name TEXT NOT NULL DEFAULT 'EVENT PRO',
  slogan_fr TEXT NOT NULL DEFAULT 'Vos événements, notre expertise. Vos moments, notre passion.',
  phone TEXT NOT NULL DEFAULT '+212 6 00 00 00 00',
  whatsapp_number TEXT NOT NULL DEFAULT '+212600000000',
  email TEXT NOT NULL DEFAULT 'contact@eventpro-casablanca.ma',
  address_fr TEXT NOT NULL DEFAULT 'Quartier Racine / Anfa, Casablanca, Maroc',
  service_area_fr TEXT NOT NULL DEFAULT 'Casablanca, Dar Bouazza, Bouskoura, Mohammedia et Rabat',
  instagram_url TEXT DEFAULT 'https://instagram.com',
  facebook_url TEXT DEFAULT 'https://facebook.com',
  currency TEXT NOT NULL DEFAULT 'MAD',
  logo_url TEXT DEFAULT '',
  booking_notice_fr TEXT NOT NULL DEFAULT 'Toutes les demandes font l''objet d''une validation personnalisée sous 24h ouvrées.',
  turnstile_enabled INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rate_limits (
  rate_key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  window_start INTEGER NOT NULL
);
