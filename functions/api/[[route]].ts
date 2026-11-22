import type { Env } from '../lib/types.ts';
import {
  bootstrapFirstAdmin,
  createSession,
  getAdminSetupStatus,
  getSessionFromRequest,
  revokeSession,
  verifyAdminPasscode,
  verifyUserCredentials,
} from '../lib/auth.ts';
import {
  checkRateLimit,
  generateOpaqueToken,
  generateReferenceCode,
  getCorsHeaders,
  hashPassword,
  isSafeMediaUrl,
  isValidEmail,
  isValidMoroccanOrIntlPhone,
  jsonResponse,
  sanitizeText,
  sha256Hex,
  verifyTurnstileToken,
} from '../lib/security.ts';

export interface PagesContext {
  request: Request;
  env: Env;
}

const BOOKING_STATUSES = [
  'Nouvelle demande',
  "En cours d'étude",
  'Devis envoyé',
  'Confirmé',
  'Terminé',
  'Annulé',
];

const QUOTE_STATUSES = [
  'Nouvelle demande',
  'En cours',
  'Devis envoyé',
  'En attente du client',
  'Accepté',
  'Refusé',
  'Annulé',
];

async function parseJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const data = await request.json();
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();
  const cors = getCorsHeaders(request, env.ALLOWED_ORIGIN);

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const reply = (data: unknown, status = 200) => jsonResponse(data, status, cors);

  try {
    // 1. Health Check
    if (path === '/api/health' && method === 'GET') {
      return reply({ ok: true, service: 'EVENT PRO API', timezone: 'Africa/Casablanca' });
    }

    // 2. Serve R2 Media
    if (path.startsWith('/api/media/') && method === 'GET') {
      const key = decodeURIComponent(path.slice('/api/media/'.length));
      if (!key || key.includes('..') || !env.MEDIA_BUCKET) {
        return new Response('Image introuvable', { status: 404 });
      }
      const object = await env.MEDIA_BUCKET.get(key);
      if (!object) {
        return new Response('Image introuvable', { status: 404 });
      }
      return new Response(object.body as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 3. Public Settings
    if (path === '/api/public/settings' && method === 'GET') {
      const settings = await env.DB.prepare(
        `SELECT company_name, slogan_fr, phone, whatsapp_number, email, address_fr,
                service_area_fr, instagram_url, facebook_url, currency, logo_url, booking_notice_fr
         FROM company_settings WHERE id = 1`
      ).first();
      return reply({
        settings: settings || {
          company_name: 'EVENT PRO',
          slogan_fr: 'Vos événements, notre expertise. Vos moments, notre passion.',
          phone: '+212 6 00 00 00 00',
          whatsapp_number: '+212600000000',
          email: 'contact@eventpro-casablanca.ma',
          address_fr: "Boulevard d'Anfa, Quartier Racine, Casablanca, Maroc",
          service_area_fr: 'Casablanca, Dar Bouazza, Bouskoura, Mohammedia',
          currency: 'MAD',
        },
        turnstileEnabled: Boolean(env.TURNSTILE_SECRET_KEY),
      });
    }

    // 4. Public Services & Categories
    if (path === '/api/public/services' && method === 'GET') {
      const { results: categories } = await env.DB.prepare(
        'SELECT * FROM service_categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
      ).all();
      const { results: services } = await env.DB.prepare(
        'SELECT * FROM services WHERE is_available = 1 ORDER BY sort_order ASC, id ASC'
      ).all();
      return reply({ categories, services });
    }

    // 5. Public Gallery
    if (path === '/api/public/gallery' && method === 'GET') {
      const category = sanitizeText(url.searchParams.get('category') || '', 80);
      const { results } =
        category && category !== 'Toutes'
          ? await env.DB.prepare(
              'SELECT * FROM gallery_images WHERE category = ? ORDER BY sort_order ASC, id DESC'
            )
              .bind(category)
              .all()
          : await env.DB.prepare(
              'SELECT * FROM gallery_images ORDER BY sort_order ASC, id DESC'
            ).all();
      return reply({ images: results });
    }

    // 6. Public Testimonials
    if (path === '/api/public/testimonials' && method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM testimonials WHERE is_published = 1 ORDER BY sort_order ASC, id DESC'
      ).all();
      return reply({ testimonials: results });
    }

    // 7. Submit Booking Request
    if (path === '/api/bookings' && method === 'POST') {
      const ip = getClientIp(request);
      const allowed = await checkRateLimit(env.DB, `booking:${ip}`, 10, 300);
      if (!allowed) {
        return reply({ error: 'Trop de demandes envoyées. Veuillez patienter quelques minutes.' }, 429);
      }

      const body = await parseJsonBody(request);
      if (!body) return reply({ error: 'Corps de requête JSON invalide.' }, 400);

      const turnstileOk = await verifyTurnstileToken(
        env.TURNSTILE_SECRET_KEY,
        sanitizeText(body.turnstileToken, 2048),
        ip
      );
      if (!turnstileOk) {
        return reply({ error: 'Vérification anti-spam Turnstile échouée.' }, 400);
      }

      const eventType = sanitizeText(body.eventType, 100);
      const eventTitle = sanitizeText(body.eventTitle, 160);
      const eventDate = sanitizeText(body.eventDate, 30);
      const preferredTime = sanitizeText(body.preferredTime, 30);
      const eventLocation = sanitizeText(body.eventLocation, 200);
      const venueChoice = sanitizeText(body.venueChoice, 200);
      const guestCount = Math.max(1, Math.min(10000, Number(body.guestCount) || 50));
      const eventDuration = sanitizeText(body.eventDuration, 100);
      const estimatedBudget = sanitizeText(body.estimatedBudget, 100);
      const preferredStyle = sanitizeText(body.preferredStyle, 120);
      const colorTheme = sanitizeText(body.colorTheme, 120);
      const specialRequirements = sanitizeText(body.specialRequirements, 1200);
      const additionalNotes = sanitizeText(body.additionalNotes, 1200);
      const fullName = sanitizeText(body.fullName, 120);
      const email = sanitizeText(body.email, 180).toLowerCase();
      const phone = sanitizeText(body.phone, 40);
      const whatsapp = sanitizeText(body.whatsapp, 40) || phone;
      const preferredContactRaw = sanitizeText(body.preferredContact, 20) || 'whatsapp';
      const preferredContact = ['whatsapp', 'telephone', 'email'].includes(preferredContactRaw)
        ? preferredContactRaw
        : 'whatsapp';

      if (!eventType || !eventTitle || !eventDate || !eventLocation || !estimatedBudget) {
        return reply({ error: "Veuillez renseigner tous les champs obligatoires de l'événement." }, 400);
      }
      if (!fullName || !isValidEmail(email) || !isValidMoroccanOrIntlPhone(phone)) {
        return reply(
          { error: 'Veuillez fournir un nom complet, un email valide et un numéro de téléphone marocain (+212 ou 06/07/05).' },
          400
        );
      }

      const session = await getSessionFromRequest(request, env.DB);

      // Upsert customer record
      let customer = await env.DB.prepare('SELECT id FROM customers WHERE email = ?')
        .bind(email)
        .first<{ id: number }>();

      let customerId: number;
      if (customer) {
        customerId = customer.id;
        await env.DB.prepare(
          "UPDATE customers SET full_name = ?, phone = ?, whatsapp = ?, preferred_contact = ?, updated_at = datetime('now') WHERE id = ?"
        )
          .bind(fullName, phone, whatsapp, preferredContact, customerId)
          .run();
      } else {
        const custRes = await env.DB.prepare(
          'INSERT INTO customers (user_id, full_name, email, phone, whatsapp, preferred_contact) VALUES (?, ?, ?, ?, ?, ?)'
        )
          .bind(session?.userId ?? null, fullName, email, phone, whatsapp, preferredContact)
          .run();
        customerId = Number(custRes.meta.last_row_id);
      }

      const referenceCode = generateReferenceCode('EP-RES');
      const insertBooking = await env.DB.prepare(
        `INSERT INTO bookings (
          reference_code, customer_id, user_id, event_type, event_title, event_date,
          preferred_time, event_location, venue_choice, guest_count, event_duration,
          estimated_budget, preferred_style, color_theme, special_requirements,
          additional_notes, full_name, email, phone, whatsapp, preferred_contact, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Nouvelle demande')`
      )
        .bind(
          referenceCode,
          customerId,
          session?.userId ?? null,
          eventType,
          eventTitle,
          eventDate,
          preferredTime,
          eventLocation,
          venueChoice,
          guestCount,
          eventDuration,
          estimatedBudget,
          preferredStyle,
          colorTheme,
          specialRequirements,
          additionalNotes,
          fullName,
          email,
          phone,
          whatsapp,
          preferredContact
        )
        .run();

      const bookingId = Number(insertBooking.meta.last_row_id);

      const selectedServices = Array.isArray(body.selectedServices) ? body.selectedServices : [];
      for (const item of selectedServices.slice(0, 20)) {
        if (item && typeof item === 'object') {
          const svc = item as Record<string, unknown>;
          const serviceName = sanitizeText(svc.name || svc.serviceName, 120);
          if (!serviceName) continue;
          const serviceId = typeof svc.serviceId === 'number' ? svc.serviceId : null;
          const opts = Array.isArray(svc.options)
            ? svc.options.map((o) => sanitizeText(o, 120)).filter(Boolean)
            : [];
          await env.DB.prepare(
            'INSERT INTO booking_services (booking_id, service_id, service_name, selected_options_json) VALUES (?, ?, ?, ?)'
          )
            .bind(bookingId, serviceId, serviceName, JSON.stringify(opts))
            .run();
        }
      }

      if (session?.userId) {
        await env.DB.prepare(
          'INSERT INTO notifications (user_id, title_fr, message_fr, link_path) VALUES (?, ?, ?, ?)'
        )
          .bind(
            session.userId,
            'Demande de réservation enregistrée',
            `Votre demande ${referenceCode} (${eventTitle}) a bien été transmise à notre équipe.`,
            '/client'
          )
          .run();
      }

      return reply(
        {
          ok: true,
          referenceCode,
          bookingId,
          message:
            'Votre demande a bien été envoyée. Notre équipe vous contactera pour confirmer les détails de votre événement.',
        },
        201
      );
    }

    // 8. Submit Quote Request
    if (path === '/api/quotes' && method === 'POST') {
      const ip = getClientIp(request);
      const allowed = await checkRateLimit(env.DB, `quote:${ip}`, 10, 300);
      if (!allowed) {
        return reply({ error: 'Trop de demandes envoyées. Veuillez patienter.' }, 429);
      }

      const body = await parseJsonBody(request);
      if (!body) return reply({ error: 'Requête JSON invalide.' }, 400);

      const turnstileOk = await verifyTurnstileToken(
        env.TURNSTILE_SECRET_KEY,
        sanitizeText(body.turnstileToken, 2048),
        ip
      );
      if (!turnstileOk) {
        return reply({ error: 'Vérification anti-spam Turnstile échouée.' }, 400);
      }

      const eventType = sanitizeText(body.eventType, 100);
      const eventDate = sanitizeText(body.eventDate, 30);
      const eventLocation = sanitizeText(body.eventLocation, 200);
      const guestCount = Math.max(1, Math.min(10000, Number(body.guestCount) || 50));
      const budgetRange = sanitizeText(body.budgetRange, 100);
      const details = sanitizeText(body.details, 2000);
      const clientName = sanitizeText(body.clientName, 120);
      const clientEmail = sanitizeText(body.clientEmail, 180).toLowerCase();
      const clientPhone = sanitizeText(body.clientPhone, 40);
      const requestedServices = Array.isArray(body.requestedServices)
        ? body.requestedServices.map((s) => sanitizeText(s, 100)).filter(Boolean).slice(0, 20)
        : [];

      if (!eventType || !eventLocation || !budgetRange || !clientName || !isValidEmail(clientEmail) || !isValidMoroccanOrIntlPhone(clientPhone)) {
        return reply({ error: 'Veuillez vérifier les informations requises et vos coordonnées.' }, 400);
      }

      const session = await getSessionFromRequest(request, env.DB);

      let customer = await env.DB.prepare('SELECT id FROM customers WHERE email = ?')
        .bind(clientEmail)
        .first<{ id: number }>();

      let customerId: number;
      if (customer) {
        customerId = customer.id;
      } else {
        const custRes = await env.DB.prepare(
          'INSERT INTO customers (user_id, full_name, email, phone) VALUES (?, ?, ?, ?)'
        )
          .bind(session?.userId ?? null, clientName, clientEmail, clientPhone)
          .run();
        customerId = Number(custRes.meta.last_row_id);
      }

      const referenceCode = generateReferenceCode('EP-DEV');
      const res = await env.DB.prepare(
        `INSERT INTO quotes (
          reference_code, customer_id, user_id, event_type, event_date, event_location,
          guest_count, requested_services_json, budget_range, details,
          client_name, client_email, client_phone, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Nouvelle demande')`
      )
        .bind(
          referenceCode,
          customerId,
          session?.userId ?? null,
          eventType,
          eventDate,
          eventLocation,
          guestCount,
          JSON.stringify(requestedServices),
          budgetRange,
          details,
          clientName,
          clientEmail,
          clientPhone
        )
        .run();

      const quoteId = Number(res.meta.last_row_id);
      if (session?.userId) {
        await env.DB.prepare(
          'INSERT INTO notifications (user_id, title_fr, message_fr, link_path) VALUES (?, ?, ?, ?)'
        )
          .bind(
            session.userId,
            'Demande de devis enregistrée',
            `Votre demande de devis ${referenceCode} est en cours d'étude par EVENT PRO.`,
            '/client'
          )
          .run();
      }

      return reply({ ok: true, referenceCode, quoteId }, 201);
    }

    // 9. Submit Contact Message
    if (path === '/api/contact' && method === 'POST') {
      const ip = getClientIp(request);
      const allowed = await checkRateLimit(env.DB, `contact:${ip}`, 10, 300);
      if (!allowed) {
        return reply({ error: 'Trop de messages envoyés. Veuillez patienter.' }, 429);
      }

      const body = await parseJsonBody(request);
      if (!body) return reply({ error: 'Requête JSON invalide.' }, 400);

      const turnstileOk = await verifyTurnstileToken(
        env.TURNSTILE_SECRET_KEY,
        sanitizeText(body.turnstileToken, 2048),
        ip
      );
      if (!turnstileOk) {
        return reply({ error: 'Vérification anti-spam Turnstile échouée.' }, 400);
      }

      const name = sanitizeText(body.name, 120);
      const email = sanitizeText(body.email, 180).toLowerCase();
      const phone = sanitizeText(body.phone, 40);
      const subject = sanitizeText(body.subject, 160);
      const message = sanitizeText(body.message, 2500);

      if (!name || !isValidEmail(email) || !subject || message.length < 10) {
        return reply({ error: 'Veuillez compléter tous les champs (message minimum 10 caractères).' }, 400);
      }

      await env.DB.prepare(
        'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(name, email, phone, subject, message)
        .run();

      return reply({ ok: true, message: 'Votre message a bien été envoyé. Notre équipe vous répondra rapidement.' }, 201);
    }

    // 10. Authentication Routes
    if (path === '/api/auth/register' && method === 'POST') {
      const ip = getClientIp(request);
      const allowed = await checkRateLimit(env.DB, `auth:${ip}`, 15, 300);
      if (!allowed) return reply({ error: 'Trop de tentatives. Patientez quelques minutes.' }, 429);

      const body = await parseJsonBody(request);
      if (!body) return reply({ error: 'Requête invalide.' }, 400);

      const fullName = sanitizeText(body.fullName, 120);
      const email = sanitizeText(body.email, 180).toLowerCase();
      const phone = sanitizeText(body.phone, 40);
      const password = typeof body.password === 'string' ? body.password : '';

      if (!fullName || !isValidEmail(email) || password.length < 8) {
        return reply({ error: 'Nom, email valide et mot de passe (8 caractères minimum) requis.' }, 400);
      }

      const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(email)
        .first<{ id: number }>();
      if (existing) {
        return reply({ error: 'Un compte existe déjà avec cette adresse email.' }, 409);
      }

      const passwordHash = await hashPassword(password);
      const userRes = await env.DB.prepare(
        "INSERT INTO users (email, password_hash, full_name, phone, whatsapp, role) VALUES (?, ?, ?, ?, ?, 'client')"
      )
        .bind(email, passwordHash, fullName, phone, phone)
        .run();
      const userId = Number(userRes.meta.last_row_id);

      // Link any existing customer/bookings/quotes matching this verified email
      await env.DB.prepare(
        'INSERT INTO customers (user_id, full_name, email, phone, whatsapp) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET user_id = excluded.user_id'
      )
        .bind(userId, fullName, email, phone || '+212 6 00 00 00 00', phone)
        .run();
      await env.DB.prepare('UPDATE bookings SET user_id = ? WHERE email = ? AND user_id IS NULL')
        .bind(userId, email)
        .run();
      await env.DB.prepare('UPDATE quotes SET user_id = ? WHERE client_email = ? AND user_id IS NULL')
        .bind(userId, email)
        .run();

      await env.DB.prepare(
        'INSERT INTO notifications (user_id, title_fr, message_fr, link_path) VALUES (?, ?, ?, ?)'
      )
        .bind(
          userId,
          'Bienvenue chez EVENT PRO',
          'Votre espace client est prêt. Suivez vos réservations et devis personnalisés à tout moment.',
          '/client'
        )
        .run();

      const session = await createSession(env.DB, userId, 'client');
      return reply(
        {
          token: session.token,
          user: { id: userId, email, fullName, phone, role: 'client' },
        },
        201
      );
    }

    if (path === '/api/auth/login' && method === 'POST') {
      const ip = getClientIp(request);
      const allowed = await checkRateLimit(env.DB, `login:${ip}`, 20, 300);
      if (!allowed) return reply({ error: 'Trop de tentatives de connexion.' }, 429);

      const body = await parseJsonBody(request);
      if (!body) return reply({ error: 'Requête invalide.' }, 400);

      const email = sanitizeText(body.email, 180).toLowerCase();
      const password = typeof body.password === 'string' ? body.password : '';
      if (!email || !password) return reply({ error: 'Email et mot de passe requis.' }, 400);

      const user = await verifyUserCredentials(env.DB, email, password);
      if (!user) return reply({ error: 'Identifiants incorrects.' }, 401);

      const session = await createSession(env.DB, user.id, user.role);
      return reply({
        token: session.token,
        user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
      });
    }

    if (path === '/api/auth/logout' && method === 'POST') {
      await revokeSession(request, env.DB);
      return reply({ ok: true });
    }

    if (path === '/api/auth/recover' && method === 'POST') {
      const ip = getClientIp(request);
      const allowed = await checkRateLimit(env.DB, `recover:${ip}`, 8, 300);
      if (!allowed) return reply({ error: 'Trop de demandes. Réessayez plus tard.' }, 429);

      const body = await parseJsonBody(request);
      const email = sanitizeText(body?.email, 180).toLowerCase();
      if (!isValidEmail(email)) {
        return reply({ error: 'Adresse email invalide.' }, 400);
      }

      const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(email)
        .first<{ id: number }>();

      if (user) {
        const rawResetToken = generateOpaqueToken(20);
        const tokenHash = await sha256Hex(rawResetToken);
        const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
        await env.DB.prepare(
          'UPDATE users SET reset_token_hash = ?, reset_expires_at = ? WHERE id = ?'
        )
          .bind(tokenHash, expiresAt, user.id)
          .run();
      }

      return reply({
        ok: true,
        message:
          'Si un compte correspond à cette adresse, les instructions de réinitialisation ont été préparées. Contactez notre équipe support si besoin.',
      });
    }

    if (path === '/api/auth/reset-password' && method === 'POST') {
      const body = await parseJsonBody(request);
      const token = sanitizeText(body?.token, 128);
      const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
      if (!token || newPassword.length < 8) {
        return reply({ error: 'Jeton valide et nouveau mot de passe (8+ caractères) requis.' }, 400);
      }
      const tokenHash = await sha256Hex(token);
      const user = await env.DB.prepare(
        'SELECT id, reset_expires_at FROM users WHERE reset_token_hash = ?'
      )
        .bind(tokenHash)
        .first<{ id: number; reset_expires_at: string }>();

      if (!user || !user.reset_expires_at || new Date(user.reset_expires_at).getTime() < Date.now()) {
        return reply({ error: 'Jeton expiré ou invalide.' }, 400);
      }

      const passwordHash = await hashPassword(newPassword);
      await env.DB.prepare(
        "UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_expires_at = NULL, updated_at = datetime('now') WHERE id = ?"
      )
        .bind(passwordHash, user.id)
        .run();

      return reply({ ok: true, message: 'Mot de passe mis à jour avec succès.' });
    }

    if (path === '/api/auth/me' && method === 'GET') {
      const session = await getSessionFromRequest(request, env.DB);
      if (!session) return reply({ user: null }, 200);
      const details = await env.DB.prepare(
        'SELECT id, email, full_name, phone, whatsapp, role FROM users WHERE id = ?'
      )
        .bind(session.userId)
        .first();
      return reply({ user: details });
    }

    // 11. Admin Auth & First-Run Setup
    if (path === '/api/auth/admin-status' && method === 'GET') {
      const status = await getAdminSetupStatus(env);
      return reply(status);
    }

    if (path === '/api/auth/admin-setup' && method === 'POST') {
      const body = await parseJsonBody(request);
      if (!body) return reply({ error: 'Requête invalide.' }, 400);
      const email = sanitizeText(body.email, 180).toLowerCase();
      const fullName = sanitizeText(body.fullName, 120) || 'Administrateur EVENT PRO';
      const password = typeof body.password === 'string' ? body.password : '';

      if (!isValidEmail(email) || password.length < 8) {
        return reply({ error: 'Email valide et mot de passe de 8 caractères minimum requis.' }, 400);
      }

      const created = await bootstrapFirstAdmin(env, { email, fullName, password });
      if (!created) {
        return reply(
          { error: 'La configuration administrateur initiale est déjà verrouillée.' },
          403
        );
      }

      return reply(
        {
          token: created.token,
          user: {
            id: created.userId,
            email: created.email,
            fullName: created.fullName,
            role: 'admin',
          },
        },
        201
      );
    }

    if (path === '/api/auth/admin-login' && method === 'POST') {
      const ip = getClientIp(request);
      const allowed = await checkRateLimit(env.DB, `adminlogin:${ip}`, 15, 300);
      if (!allowed) return reply({ error: 'Trop de tentatives.' }, 429);

      const body = await parseJsonBody(request);
      if (!body) return reply({ error: 'Requête invalide.' }, 400);

      const passcode = typeof body.passcode === 'string' ? body.passcode : '';
      const email = sanitizeText(body.email, 180).toLowerCase();
      const password = typeof body.password === 'string' ? body.password : '';

      if (env.ADMIN_PASSCODE && env.ADMIN_PASSCODE.trim().length > 0 && passcode) {
        const ok = await verifyAdminPasscode(passcode, env.ADMIN_PASSCODE);
        if (!ok) return reply({ error: "Code d'accès administrateur invalide." }, 401);

        let adminUser = await env.DB.prepare(
          "SELECT id, email, full_name, role FROM users WHERE role = 'admin' LIMIT 1"
        ).first<{ id: number; email: string; full_name: string; role: 'admin' }>();

        if (!adminUser) {
          const dummyHash = await hashPassword(generateOpaqueToken(16));
          const res = await env.DB.prepare(
            "INSERT INTO users (email, password_hash, full_name, role) VALUES ('admin@eventpro-casablanca.ma', ?, 'Direction EVENT PRO', 'admin')"
          )
            .bind(dummyHash)
            .run();
          adminUser = {
            id: Number(res.meta.last_row_id),
            email: 'admin@eventpro-casablanca.ma',
            full_name: 'Direction EVENT PRO',
            role: 'admin',
          };
        }

        const session = await createSession(env.DB, adminUser.id, 'admin');
        return reply({
          token: session.token,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            fullName: adminUser.full_name,
            role: 'admin',
          },
        });
      }

      if (!email || !password) {
        return reply({ error: 'Email et mot de passe administrateur requis.' }, 400);
      }

      const user = await verifyUserCredentials(env.DB, email, password);
      if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
        return reply({ error: 'Accès administrateur refusé.' }, 401);
      }

      const session = await createSession(env.DB, user.id, user.role);
      return reply({
        token: session.token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
      });
    }

    // 12. Client Protected Routes
    if (path.startsWith('/api/client/')) {
      const session = await getSessionFromRequest(request, env.DB);
      if (!session) return reply({ error: 'Authentification requise.' }, 401);

      if (path === '/api/client/overview' && method === 'GET') {
        const profile = await env.DB.prepare(
          'SELECT id, email, full_name, phone, whatsapp, role, created_at FROM users WHERE id = ?'
        )
          .bind(session.userId)
          .first();

        const { results: bookings } = await env.DB.prepare(
          `SELECT id, reference_code, event_type, event_title, event_date, preferred_time,
                  event_location, guest_count, estimated_budget, status, created_at
           FROM bookings
           WHERE user_id = ?
           ORDER BY created_at DESC`
        )
          .bind(session.userId)
          .all();

        const { results: quotes } = await env.DB.prepare(
          `SELECT id, reference_code, event_type, event_date, event_location, guest_count,
                  budget_range, status, subtotal_mad, discount_mad, total_mad, valid_until, created_at
           FROM quotes
           WHERE user_id = ?
           ORDER BY created_at DESC`
        )
          .bind(session.userId)
          .all();

        const { results: notifications } = await env.DB.prepare(
          'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
        )
          .bind(session.userId)
          .all();

        return reply({ profile, bookings, quotes, notifications });
      }

      if (path === '/api/client/profile' && method === 'PATCH') {
        const body = await parseJsonBody(request);
        if (!body) return reply({ error: 'Requête invalide.' }, 400);
        const fullName = sanitizeText(body.fullName, 120);
        const phone = sanitizeText(body.phone, 40);
        const whatsapp = sanitizeText(body.whatsapp, 40);
        if (!fullName) return reply({ error: 'Le nom complet est requis.' }, 400);

        await env.DB.prepare(
          "UPDATE users SET full_name = ?, phone = ?, whatsapp = ?, updated_at = datetime('now') WHERE id = ?"
        )
          .bind(fullName, phone, whatsapp, session.userId)
          .run();

        await env.DB.prepare(
          "UPDATE customers SET full_name = ?, phone = ?, whatsapp = ?, updated_at = datetime('now') WHERE user_id = ?"
        )
          .bind(fullName, phone, whatsapp, session.userId)
          .run();

        return reply({ ok: true });
      }

      if (path === '/api/client/notifications/read' && method === 'POST') {
        await env.DB.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?')
          .bind(session.userId)
          .run();
        return reply({ ok: true });
      }
    }

    // 13. Admin Protected Routes
    if (path.startsWith('/api/admin/')) {
      const session = await getSessionFromRequest(request, env.DB);
      if (!session || (session.role !== 'admin' && session.role !== 'manager')) {
        return reply({ error: 'Accès réservé aux administrateurs.' }, 403);
      }

      // Overview KPIs
      if (path === '/api/admin/overview' && method === 'GET') {
        const totalBookings = await env.DB.prepare('SELECT COUNT(*) as c FROM bookings').first<{ c: number }>();
        const newBookings = await env.DB.prepare(
          "SELECT COUNT(*) as c FROM bookings WHERE status = 'Nouvelle demande'"
        ).first<{ c: number }>();
        const pendingQuotes = await env.DB.prepare(
          "SELECT COUNT(*) as c FROM quotes WHERE status IN ('Nouvelle demande', 'En cours', 'En attente du client')"
        ).first<{ c: number }>();
        const confirmedEvents = await env.DB.prepare(
          "SELECT COUNT(*) as c FROM bookings WHERE status = 'Confirmé'"
        ).first<{ c: number }>();
        const upcomingEvents = await env.DB.prepare(
          "SELECT COUNT(*) as c FROM bookings WHERE event_date >= date('now') AND status != 'Annulé'"
        ).first<{ c: number }>();
        const totalCustomers = await env.DB.prepare('SELECT COUNT(*) as c FROM customers').first<{ c: number }>();
        const unreadMessages = await env.DB.prepare(
          "SELECT COUNT(*) as c FROM contact_messages WHERE status = 'unread'"
        ).first<{ c: number }>();

        const { results: recentBookings } = await env.DB.prepare(
          'SELECT * FROM bookings ORDER BY created_at DESC LIMIT 6'
        ).all();
        const { results: recentMessages } = await env.DB.prepare(
          'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5'
        ).all();
        const { results: byCategory } = await env.DB.prepare(
          'SELECT event_type, COUNT(*) as count FROM bookings GROUP BY event_type ORDER BY count DESC'
        ).all();

        return reply({
          stats: {
            totalBookings: totalBookings?.c ?? 0,
            newRequests: newBookings?.c ?? 0,
            pendingQuotes: pendingQuotes?.c ?? 0,
            confirmedEvents: confirmedEvents?.c ?? 0,
            upcomingEvents: upcomingEvents?.c ?? 0,
            totalCustomers: totalCustomers?.c ?? 0,
            unreadMessages: unreadMessages?.c ?? 0,
          },
          recentBookings,
          recentMessages,
          byCategory,
        });
      }

      // Admin Bookings
      if (path === '/api/admin/bookings' && method === 'GET') {
        const { results: bookings } = await env.DB.prepare(
          'SELECT * FROM bookings ORDER BY created_at DESC'
        ).all();
        const { results: services } = await env.DB.prepare('SELECT * FROM booking_services').all();
        return reply({ bookings, bookingServices: services });
      }

      if (path.startsWith('/api/admin/bookings/') && method === 'PATCH') {
        const id = Number(path.split('/').pop());
        if (!Number.isInteger(id)) return reply({ error: 'ID invalide.' }, 400);
        const body = await parseJsonBody(request);
        if (!body) return reply({ error: 'Requête invalide.' }, 400);

        const status = sanitizeText(body.status, 60);
        const internalNotes = sanitizeText(body.internal_notes, 2000);
        const assignedTo = sanitizeText(body.assigned_to, 120);
        const eventDate = sanitizeText(body.event_date, 30);

        if (status && !BOOKING_STATUSES.includes(status)) {
          return reply({ error: 'Statut de réservation non autorisé.' }, 400);
        }

        await env.DB.prepare(
          `UPDATE bookings
           SET status = COALESCE(NULLIF(?, ''), status),
               internal_notes = COALESCE(?, internal_notes),
               assigned_to = COALESCE(?, assigned_to),
               event_date = COALESCE(NULLIF(?, ''), event_date),
               updated_at = datetime('now')
           WHERE id = ?`
        )
          .bind(
            status,
            body.internal_notes !== undefined ? internalNotes : null,
            body.assigned_to !== undefined ? assignedTo : null,
            eventDate,
            id
          )
          .run();

        // Notify user if linked
        const booking = await env.DB.prepare(
          'SELECT user_id, reference_code, status FROM bookings WHERE id = ?'
        )
          .bind(id)
          .first<{ user_id: number | null; reference_code: string; status: string }>();

        if (booking?.user_id && status) {
          await env.DB.prepare(
            'INSERT INTO notifications (user_id, title_fr, message_fr, link_path) VALUES (?, ?, ?, ?)'
          )
            .bind(
              booking.user_id,
              'Mise à jour de votre réservation',
              `Votre dossier ${booking.reference_code} est désormais : ${booking.status}.`,
              '/client'
            )
            .run();
        }

        return reply({ ok: true });
      }

      if (path.startsWith('/api/admin/bookings/') && method === 'DELETE') {
        const id = Number(path.split('/').pop());
        await env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(id).run();
        return reply({ ok: true });
      }

      // Admin Quotes
      if (path === '/api/admin/quotes' && method === 'GET') {
        const { results: quotes } = await env.DB.prepare(
          'SELECT * FROM quotes ORDER BY created_at DESC'
        ).all();
        const { results: items } = await env.DB.prepare(
          'SELECT * FROM quote_items ORDER BY sort_order ASC, id ASC'
        ).all();
        return reply({ quotes, quoteItems: items });
      }

      if (path === '/api/admin/quotes' && method === 'POST') {
        const body = await parseJsonBody(request);
        if (!body) return reply({ error: 'Requête invalide.' }, 400);

        const clientName = sanitizeText(body.client_name, 120);
        const clientEmail = sanitizeText(body.client_email, 180).toLowerCase();
        const clientPhone = sanitizeText(body.client_phone, 40);
        const eventType = sanitizeText(body.event_type, 100);
        const eventDate = sanitizeText(body.event_date, 30);
        const eventLocation = sanitizeText(body.event_location, 180) || 'Casablanca';
        const guestCount = Math.max(1, Number(body.guest_count) || 50);
        const budgetRange = sanitizeText(body.budget_range, 100) || 'Budget personnalisé';
        const validUntil = sanitizeText(body.valid_until, 30);
        const adminNotes = sanitizeText(body.admin_notes, 2000);
        const discountMad = Math.max(0, Number(body.discount_mad) || 0);
        const items = Array.isArray(body.items) ? body.items : [];

        if (!clientName || !isValidEmail(clientEmail) || !eventType) {
          return reply({ error: 'Nom client, email valide et type d’événement requis.' }, 400);
        }

        let subtotal = 0;
        const normalizedItems = items.map((it, idx) => {
          const itemObj = (it && typeof it === 'object' ? it : {}) as Record<string, unknown>;
          const description = sanitizeText(itemObj.description, 200);
          const quantity = Math.max(1, Number(itemObj.quantity) || 1);
          const unitPrice = Math.max(0, Number(itemObj.unit_price_mad) || 0);
          const lineTotal = quantity * unitPrice;
          subtotal += lineTotal;
          return { description, quantity, unitPrice, lineTotal, sortOrder: idx + 1 };
        }).filter((i) => i.description);

        const totalMad = Math.max(0, subtotal - discountMad);
        const referenceCode = generateReferenceCode('EP-DEV');

        const res = await env.DB.prepare(
          `INSERT INTO quotes (
            reference_code, booking_id, event_type, event_date, event_location, guest_count,
            budget_range, client_name, client_email, client_phone, status,
            subtotal_mad, discount_mad, total_mad, valid_until, admin_notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Devis envoyé', ?, ?, ?, ?, ?)`
        )
          .bind(
            referenceCode,
            typeof body.booking_id === 'number' ? body.booking_id : null,
            eventType,
            eventDate,
            eventLocation,
            guestCount,
            budgetRange,
            clientName,
            clientEmail,
            clientPhone,
            subtotal,
            discountMad,
            totalMad,
            validUntil,
            adminNotes
          )
          .run();

        const quoteId = Number(res.meta.last_row_id);
        for (const it of normalizedItems) {
          await env.DB.prepare(
            'INSERT INTO quote_items (quote_id, description, quantity, unit_price_mad, line_total_mad, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
          )
            .bind(quoteId, it.description, it.quantity, it.unitPrice, it.lineTotal, it.sortOrder)
            .run();
        }

        return reply({ ok: true, quoteId, referenceCode }, 201);
      }

      if (path.startsWith('/api/admin/quotes/') && method === 'PATCH') {
        const id = Number(path.split('/').pop());
        if (!Number.isInteger(id)) return reply({ error: 'ID invalide.' }, 400);
        const body = await parseJsonBody(request);
        if (!body) return reply({ error: 'Requête invalide.' }, 400);

        const status = sanitizeText(body.status, 60);
        if (status && !QUOTE_STATUSES.includes(status)) {
          return reply({ error: 'Statut de devis invalide.' }, 400);
        }

        const discountMad = body.discount_mad !== undefined ? Math.max(0, Number(body.discount_mad) || 0) : null;
        const adminNotes = body.admin_notes !== undefined ? sanitizeText(body.admin_notes, 2000) : null;
        const validUntil = body.valid_until !== undefined ? sanitizeText(body.valid_until, 30) : null;

        let subtotal: number | null = null;
        if (Array.isArray(body.items)) {
          await env.DB.prepare('DELETE FROM quote_items WHERE quote_id = ?').bind(id).run();
          subtotal = 0;
          let idx = 1;
          for (const rawItem of body.items) {
            if (!rawItem || typeof rawItem !== 'object') continue;
            const itemObj = rawItem as Record<string, unknown>;
            const description = sanitizeText(itemObj.description, 200);
            if (!description) continue;
            const quantity = Math.max(1, Number(itemObj.quantity) || 1);
            const unitPrice = Math.max(0, Number(itemObj.unit_price_mad) || 0);
            const lineTotal = quantity * unitPrice;
            subtotal += lineTotal;
            await env.DB.prepare(
              'INSERT INTO quote_items (quote_id, description, quantity, unit_price_mad, line_total_mad, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
            )
              .bind(id, description, quantity, unitPrice, lineTotal, idx++)
              .run();
          }
        }

        const existingQuote = await env.DB.prepare(
          'SELECT subtotal_mad, discount_mad FROM quotes WHERE id = ?'
        )
          .bind(id)
          .first<{ subtotal_mad: number; discount_mad: number }>();

        if (!existingQuote) return reply({ error: 'Devis introuvable.' }, 404);

        const finalSubtotal = subtotal !== null ? subtotal : existingQuote.subtotal_mad;
        const finalDiscount = discountMad !== null ? discountMad : existingQuote.discount_mad;
        const finalTotal = Math.max(0, finalSubtotal - finalDiscount);

        await env.DB.prepare(
          `UPDATE quotes
           SET status = COALESCE(NULLIF(?, ''), status),
               subtotal_mad = ?,
               discount_mad = ?,
               total_mad = ?,
               admin_notes = COALESCE(?, admin_notes),
               valid_until = COALESCE(?, valid_until),
               updated_at = datetime('now')
           WHERE id = ?`
        )
          .bind(status, finalSubtotal, finalDiscount, finalTotal, adminNotes, validUntil, id)
          .run();

        return reply({ ok: true, subtotal_mad: finalSubtotal, total_mad: finalTotal });
      }

      // Admin Services
      if (path === '/api/admin/services' && method === 'GET') {
        const { results: categories } = await env.DB.prepare(
          'SELECT * FROM service_categories ORDER BY sort_order ASC, id ASC'
        ).all();
        const { results: services } = await env.DB.prepare(
          'SELECT * FROM services ORDER BY sort_order ASC, id ASC'
        ).all();
        return reply({ categories, services });
      }

      if (path === '/api/admin/services' && method === 'POST') {
        const body = await parseJsonBody(request);
        if (!body) return reply({ error: 'Requête invalide.' }, 400);
        const titleFr = sanitizeText(body.title_fr, 140);
        const shortDescFr = sanitizeText(body.short_desc_fr, 400);
        const fullDescFr = sanitizeText(body.full_desc_fr, 2500) || shortDescFr;
        const categoryId = Number(body.category_id) || 1;
        const priceMad =
          body.starting_price_mad === null || body.starting_price_mad === ''
            ? null
            : Math.max(0, Number(body.starting_price_mad) || 0);
        const priceNoteFr = sanitizeText(body.price_note_fr, 160) || 'Tarif sur devis';
        const coverImage = sanitizeText(body.cover_image, 500);

        if (!titleFr || !shortDescFr) {
          return reply({ error: 'Titre et description courte requis.' }, 400);
        }
        if (coverImage && !isSafeMediaUrl(coverImage)) {
          return reply({ error: "URL d'image non valide." }, 400);
        }

        const slug = `${titleFr
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

        const res = await env.DB.prepare(
          `INSERT INTO services (
            category_id, slug, title_fr, short_desc_fr, full_desc_fr,
            benefits_json, included_json, options_json, cover_image,
            starting_price_mad, price_note_fr, is_available
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            categoryId,
            slug,
            titleFr,
            shortDescFr,
            fullDescFr,
            JSON.stringify(Array.isArray(body.benefits) ? body.benefits : []),
            JSON.stringify(Array.isArray(body.included) ? body.included : []),
            JSON.stringify(Array.isArray(body.options) ? body.options : []),
            coverImage || '/src/assets/images/service_floral_decor_1795278181542.jpg',
            priceMad,
            priceNoteFr,
            body.is_available === false ? 0 : 1
          )
          .run();

        return reply({ ok: true, id: Number(res.meta.last_row_id) }, 201);
      }

      if (path.startsWith('/api/admin/services/') && method === 'PATCH') {
        const id = Number(path.split('/').pop());
        const body = await parseJsonBody(request);
        if (!body) return reply({ error: 'Requête invalide.' }, 400);

        const titleFr = body.title_fr !== undefined ? sanitizeText(body.title_fr, 140) : null;
        const shortDescFr = body.short_desc_fr !== undefined ? sanitizeText(body.short_desc_fr, 400) : null;
        const fullDescFr = body.full_desc_fr !== undefined ? sanitizeText(body.full_desc_fr, 2500) : null;
        const priceNoteFr = body.price_note_fr !== undefined ? sanitizeText(body.price_note_fr, 160) : null;
        const coverImage = body.cover_image !== undefined ? sanitizeText(body.cover_image, 500) : null;
        if (coverImage && !isSafeMediaUrl(coverImage)) {
          return reply({ error: "URL d'image non valide." }, 400);
        }

        const hasPriceField = 'starting_price_mad' in body;
        const startingPrice =
          body.starting_price_mad === null || body.starting_price_mad === ''
            ? null
            : Math.max(0, Number(body.starting_price_mad) || 0);

        const isAvailable =
          body.is_available !== undefined ? (body.is_available ? 1 : 0) : null;

        if (hasPriceField) {
          await env.DB.prepare(
            `UPDATE services
             SET title_fr = COALESCE(?, title_fr),
                 short_desc_fr = COALESCE(?, short_desc_fr),
                 full_desc_fr = COALESCE(?, full_desc_fr),
                 starting_price_mad = ?,
                 price_note_fr = COALESCE(?, price_note_fr),
                 cover_image = COALESCE(NULLIF(?, ''), cover_image),
                 is_available = COALESCE(?, is_available),
                 updated_at = datetime('now')
             WHERE id = ?`
          )
            .bind(titleFr, shortDescFr, fullDescFr, startingPrice, priceNoteFr, coverImage, isAvailable, id)
            .run();
        } else {
          await env.DB.prepare(
            `UPDATE services
             SET title_fr = COALESCE(?, title_fr),
                 short_desc_fr = COALESCE(?, short_desc_fr),
                 full_desc_fr = COALESCE(?, full_desc_fr),
                 price_note_fr = COALESCE(?, price_note_fr),
                 cover_image = COALESCE(NULLIF(?, ''), cover_image),
                 is_available = COALESCE(?, is_available),
                 updated_at = datetime('now')
             WHERE id = ?`
          )
            .bind(titleFr, shortDescFr, fullDescFr, priceNoteFr, coverImage, isAvailable, id)
            .run();
        }

        return reply({ ok: true });
      }

      if (path.startsWith('/api/admin/services/') && method === 'DELETE') {
        const id = Number(path.split('/').pop());
        await env.DB.prepare('DELETE FROM services WHERE id = ?').bind(id).run();
        return reply({ ok: true });
      }

      // Admin Gallery
      if (path === '/api/admin/gallery' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM gallery_images ORDER BY sort_order ASC, id DESC'
        ).all();
        return reply({ images: results });
      }

      if (path === '/api/admin/gallery' && method === 'POST') {
        const body = await parseJsonBody(request);
        if (!body) return reply({ error: 'Requête invalide.' }, 400);
        const titleFr = sanitizeText(body.title_fr, 160);
        const captionFr = sanitizeText(body.caption_fr, 400);
        const category = sanitizeText(body.category, 80);
        const imageUrl = sanitizeText(body.image_url, 500);
        const r2Key = sanitizeText(body.r2_key, 250);

        if (!titleFr || !category || !isSafeMediaUrl(imageUrl)) {
          return reply({ error: "Titre, catégorie et URL d'image valides requis." }, 400);
        }

        const res = await env.DB.prepare(
          'INSERT INTO gallery_images (title_fr, caption_fr, category, image_url, r2_key) VALUES (?, ?, ?, ?, ?)'
        )
          .bind(titleFr, captionFr, category, imageUrl, r2Key)
          .run();

        return reply({ ok: true, id: Number(res.meta.last_row_id) }, 201);
      }

      if (path.startsWith('/api/admin/gallery/') && method === 'DELETE') {
        const id = Number(path.split('/').pop());
        const existing = await env.DB.prepare('SELECT r2_key FROM gallery_images WHERE id = ?')
          .bind(id)
          .first<{ r2_key: string }>();
        if (existing?.r2_key && env.MEDIA_BUCKET) {
          await env.MEDIA_BUCKET.delete(existing.r2_key);
        }
        await env.DB.prepare('DELETE FROM gallery_images WHERE id = ?').bind(id).run();
        return reply({ ok: true });
      }

      // Admin Upload to R2
      if (path === '/api/admin/upload' && method === 'POST') {
        if (!env.MEDIA_BUCKET) {
          return reply({ error: 'Stockage R2 non configuré sur cet environnement.' }, 503);
        }
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file || !(file instanceof File)) {
          return reply({ error: 'Fichier image requis.' }, 400);
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          return reply({ error: 'Format accepté : JPEG, PNG ou WebP.' }, 400);
        }
        if (file.size > 5 * 1024 * 1024) {
          return reply({ error: 'Taille maximale autorisée : 5 Mo.' }, 400);
        }

        const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
        const key = `gallery/${Date.now()}-${generateOpaqueToken(6)}.${ext}`;
        const buffer = await file.arrayBuffer();
        await env.MEDIA_BUCKET.put(key, buffer, {
          httpMetadata: {
            contentType: file.type,
            cacheControl: 'public, max-age=31536000',
          },
        });

        return reply({ ok: true, key, url: `/api/media/${key}` }, 201);
      }

      // Admin Customers
      if (path === '/api/admin/customers' && method === 'GET') {
        const { results: customers } = await env.DB.prepare(
          `SELECT c.*,
                  (SELECT COUNT(*) FROM bookings b WHERE b.customer_id = c.id) as booking_count,
                  (SELECT COUNT(*) FROM quotes q WHERE q.customer_id = c.id) as quote_count
           FROM customers c
           ORDER BY c.created_at DESC`
        ).all();
        return reply({ customers });
      }

      if (path.startsWith('/api/admin/customers/') && method === 'PATCH') {
        const id = Number(path.split('/').pop());
        const body = await parseJsonBody(request);
        if (!body) return reply({ error: 'Requête invalide.' }, 400);
        await env.DB.prepare(
          "UPDATE customers SET notes = ?, company_name = ?, city = ?, updated_at = datetime('now') WHERE id = ?"
        )
          .bind(
            sanitizeText(body.notes, 1000),
            sanitizeText(body.company_name, 140),
            sanitizeText(body.city, 100) || 'Casablanca',
            id
          )
          .run();
        return reply({ ok: true });
      }

      // Admin Messages
      if (path === '/api/admin/messages' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM contact_messages ORDER BY created_at DESC'
        ).all();
        return reply({ messages: results });
      }

      if (path.startsWith('/api/admin/messages/') && method === 'PATCH') {
        const id = Number(path.split('/').pop());
        const body = await parseJsonBody(request);
        if (!body) return reply({ error: 'Requête invalide.' }, 400);

        const status = sanitizeText(body.status, 30);
        const adminReply = sanitizeText(body.admin_reply, 2000);
        if (status && !['unread', 'read', 'replied'].includes(status)) {
          return reply({ error: 'Statut invalide.' }, 400);
        }

        await env.DB.prepare(
          `UPDATE contact_messages
           SET status = COALESCE(NULLIF(?, ''), status),
               admin_reply = COALESCE(?, admin_reply),
               replied_at = CASE WHEN ? != '' THEN datetime('now') ELSE replied_at END,
               updated_at = datetime('now')
           WHERE id = ?`
        )
          .bind(status, body.admin_reply !== undefined ? adminReply : null, adminReply, id)
          .run();
        return reply({ ok: true });
      }

      if (path.startsWith('/api/admin/messages/') && method === 'DELETE') {
        const id = Number(path.split('/').pop());
        await env.DB.prepare('DELETE FROM contact_messages WHERE id = ?').bind(id).run();
        return reply({ ok: true });
      }

      // Admin Settings
      if (path === '/api/admin/settings' && method === 'GET') {
        const settings = await env.DB.prepare('SELECT * FROM company_settings WHERE id = 1').first();
        return reply({ settings });
      }

      if (path === '/api/admin/settings' && method === 'PUT') {
        const body = await parseJsonBody(request);
        if (!body) return reply({ error: 'Requête invalide.' }, 400);

        await env.DB.prepare(
          `UPDATE company_settings
           SET company_name = ?,
               slogan_fr = ?,
               phone = ?,
               whatsapp_number = ?,
               email = ?,
               address_fr = ?,
               service_area_fr = ?,
               instagram_url = ?,
               facebook_url = ?,
               currency = ?,
               booking_notice_fr = ?,
               updated_at = datetime('now')
           WHERE id = 1`
        )
          .bind(
            sanitizeText(body.company_name, 100) || 'EVENT PRO',
            sanitizeText(body.slogan_fr, 250),
            sanitizeText(body.phone, 40),
            sanitizeText(body.whatsapp_number, 40),
            sanitizeText(body.email, 180),
            sanitizeText(body.address_fr, 250),
            sanitizeText(body.service_area_fr, 250),
            sanitizeText(body.instagram_url, 300),
            sanitizeText(body.facebook_url, 300),
            sanitizeText(body.currency, 10) || 'MAD',
            sanitizeText(body.booking_notice_fr, 400)
          )
          .run();
        return reply({ ok: true });
      }
    }

    return reply({ error: 'Endpoint introuvable.' }, 404);
  } catch (err) {
    console.error('EVENT PRO API error:', err);
    return reply({ error: 'Erreur interne du serveur.' }, 500);
  }
}
