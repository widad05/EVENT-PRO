-- EVENT PRO — Seed Data (Casablanca, Morocco)
-- Migration 0002: Default company settings, 6 categories, 11 detailed services, gallery, demo testimonials & initial sample records

INSERT OR IGNORE INTO company_settings (
  id, company_name, slogan_fr, phone, whatsapp_number, email,
  address_fr, service_area_fr, instagram_url, facebook_url,
  currency, logo_url, booking_notice_fr, turnstile_enabled
) VALUES (
  1,
  'EVENT PRO',
  'Vos événements, notre expertise. Vos moments, notre passion.',
  '+212 6 00 00 00 00',
  '+212600000000',
  'contact@eventpro-casablanca.ma',
  'Boulevard d''Anfa, Quartier Racine, Casablanca, Maroc',
  'Casablanca, Ain Diab, Dar Bouazza, Bouskoura, Mohammedia et région',
  'https://instagram.com',
  'https://facebook.com',
  'MAD',
  '',
  'Chaque réservation constitue une demande initiale étudiée par notre équipe avant confirmation définitive.',
  0
);

INSERT OR IGNORE INTO service_categories (id, slug, name_fr, name_ar, description_fr, sort_order, is_active) VALUES
  (1, 'organisation-complete', 'Organisation complète', 'التنظيم الكامل', 'Conception globale, coordination des prestataires et direction artistique le jour J.', 1, 1),
  (2, 'ceremonies-marocaines', 'Cérémonies marocaines', 'الحفلات المغربية', 'Savoir-faire traditionnel pour mariages, fiançailles et soirées henné.', 2, 1),
  (3, 'evenements-prives', 'Événements privés', 'المناسبات الخاصة', 'Anniversaires, remises de diplômes, baby showers et réceptions sur mesure.', 3, 1),
  (4, 'corporate', 'Événements professionnels', 'فعاليات الشركات', 'Séminaires, conférences, team building et dîners de gala d''entreprise.', 4, 1),
  (5, 'esthetique-gastronomie', 'Décoration & Traiteur', 'الديكور والضيافة', 'Scénographie florale, arts de la table et gastronomie marocaine et internationale.', 5, 1),
  (6, 'technique-logistique', 'Technique, Salles & Mobilier', 'التقنيات والقاعات والأثاث', 'Lieux d''exception, sonorisation, éclairage architectural, DJ et mobilier.', 6, 1);

INSERT OR IGNORE INTO services (
  id, category_id, slug, title_fr, title_ar, short_desc_fr, full_desc_fr,
  benefits_json, included_json, options_json, cover_image,
  starting_price_mad, price_note_fr, is_available, is_featured, sort_order
) VALUES
  (
    1, 1, 'organisation-mariage',
    'Organisation de mariage',
    'تنظيم حفلات الزفاف',
    'Accompagnement intégral de votre mariage à Casablanca, de la direction artistique à la coordination du jour J.',
    'Nous orchestrons chaque étape de votre mariage avec rigueur et raffinement : sélection du domaine ou de la salle à Casablanca, gestion budgétaire transparente, coordination de la négafa, des orchestres, du traiteur et présence continue de notre équipe le jour de la réception.',
    '["Interlocuteur unique dédié tout au long des préparatifs","Sélection vérifiée de prestataires casablancais","Rétroplanning précis et conducteur minute par minute"]',
    '["Conception du cahier des charges et budget prévisionnel","Recherche et visite de lieux de réception","Coordination complète des prestataires et présence jour J"]',
    '["Coordination jour J uniquement","Gestion des faire-part et accueil VIP","Service voiturier et sécurité"]',
    '/src/assets/images/category_moroccan_wedding_1795278178133.jpg',
    NULL, 'Tarif sur devis', 1, 1, 1
  ),
  (
    2, 2, 'organisation-fiancailles',
    'Organisation de fiançailles',
    'تنظيم حفلات الخطوبة',
    'Mise en scène intime et élégante pour célébrer votre union familiale dans le respect des traditions.',
    'Qu''il s''agisse d''une réception familiale à domicile dans les quartiers d''Anfa et Californie ou dans un salon privatisé, nous créons une atmosphère chaleureuse mêlant accueil marocain traditionnel et élégance contemporaine.',
    '["Respect fidèle des rituels familiaux","Adaptation aux espaces privés ou salons d''hôtel","Gestion discrète et attentionnée des invités"]',
    '["Scénographie du salon d''accueil et espace des mariés","Service de thé d''accueil, dattes fourrées et pâtisseries","Coordination musicale et prise de vue"]',
    '["Assises traditionnelles brodées","Composition florale sur mesure","Photographe dédié"]',
    '/src/assets/images/category_henna_ceremony_1795278182712.jpg',
    NULL, 'Tarif sur devis', 1, 1, 2
  ),
  (
    3, 3, 'organisation-anniversaire',
    'Organisation d''anniversaire',
    'تنظيم أعياد الميلاد',
    'Réceptions privées sur mesure, dîners en jardin ou soirées festives à Casablanca et Dar Bouazza.',
    'Nous transformons vos anniversaires, remises de diplômes ou baby showers en moments de partage mémorables : décoration thématique soignée, dîner assis ou cocktail dînatoire, gâteau artisanal et programmation musicale adaptée à vos convives.',
    '["Direction créative personnalisée selon votre thème","Logistique fluide à domicile, villa ou rooftop","Animation adaptée aux adultes comme aux familles"]',
    '["Scénographie de table et éclairage d''ambiance","Coordination traiteur, gâteau sur mesure et boissons","Sonorisation d''ambiance ou DJ"]',
    '["Photobooth éditorial","Bar à mocktails et jus frais","Animation musicale acoustique"]',
    '/src/assets/images/gallery_birthday_garden_1795278181192.jpg',
    6500, 'Exemple indicatif à partir de 6 500 MAD (selon nombre d''invités)', 1, 1, 3
  ),
  (
    4, 4, 'evenements-professionnels',
    'Organisation d''événements professionnels',
    'تنظيم فعاليات الشركات',
    'Séminaires, conférences, lancements de produits, team building et dîners de gala pour entreprises.',
    'EVENT PRO accompagne les directions générales, ressources humaines et équipes communication à Casablanca Finance City, Ain Diab et dans les pôles d''affaires. Nous garantissons ponctualité, qualité audiovisuelle irréprochable et accueil protocolaire.',
    '["Respect strict du timing et des standards corporate","Signalétique et scénographie aux couleurs de votre marque","Facturation claire et devis détaillé par poste"]',
    '["Privatisation de salle de conférence ou auditorium","Régie son, projection LED et micros HF","Pauses café, déjeuners d''affaires et accueil hôtesses"]',
    '["Captation vidéo et aftermovie corporate","Interprétariat simultané","Activités de team building à Bouskoura"]',
    '/src/assets/images/category_corporate_gala_1795278181060.jpg',
    NULL, 'Tarif sur devis', 1, 1, 4
  ),
  (
    5, 2, 'ceremonie-marocaine',
    'Organisation de cérémonie marocaine',
    'تنظيم الحفل المغربي',
    'Soirées henné, berza, baptêmes et réceptions patrimoniales portées par l''artisanat marocain.',
    'Nous mettons à l''honneur le patrimoine marocain avec justesse : salons brodés, luminaires en laiton ciselé, fleurs d''oranger, troupes Issawa ou Dekka Marrakchia et service de thé cérémoniel dans les règles de l''art.',
    '["Collaboration avec des artisans et maâlems sélectionnés","Esthétique authentique sans surcharge visuelle","Coordination complète de l''accueil et des rituels"]',
    '["Installation d''un salon marocain d''apparat et décor de henné","Mise en lumière chaleureuse par lanternes et bougies","Coordination de l''animation folklorique et du service"]',
    '["Nekacha artistique traditionnelle","Plateau de henné et accessoires artisanaux","Troupe musicale traditionnelle"]',
    '/src/assets/images/category_henna_ceremony_1795278182712.jpg',
    NULL, 'Tarif sur devis', 1, 0, 5
  ),
  (
    6, 5, 'decoration-florale',
    'Décoration & Art floral',
    'الديكور وتنسيق الزهور',
    'Scénographie sur mesure, arches florales, arts de la table et compositions végétales fraîches.',
    'Notre atelier de scénographie conçoit des décors harmonieux en harmonie avec votre lieu : palettes ivoire, sable, or brossé ou touches botaniques méditerranéennes, nappages nobles, bougeoirs et créations florales réalisées le matin même.',
    '["Fleurs fraîches sélectionnées selon la saison","Maquette d''intention et palette chromatique validées en amont","Montage et démontage intégral assurés par nos équipes"]',
    '["Centres de table floraux et chemin de table","Arts de la table, bougies et papeterie de table","Arche d''accueil ou décor d''estrade"]',
    '["Mur floral sur mesure","Éclairage architectural des compositions","Signalétique calligraphiée sur verre ou lin"]',
    '/src/assets/images/service_floral_decor_1795278181542.jpg',
    NULL, 'Tarif sur devis', 1, 1, 6
  ),
  (
    7, 5, 'traiteur-buffet',
    'Traiteur & Buffet événementiel',
    'خدمات الضيافة والبوفيه',
    'Gastronomie marocaine raffinée, cuisine méditerranéenne, cocktails dînatoires et pauses d''entreprise.',
    'Des menus pensés pour la fraîcheur, la présentation et la fluidité du service : pastillas artisanales, méchouis d''exception, pièces salées contemporaines, buffets à thème, pâtisseries marocaines et service en salle par un personnel en tenue soignée.',
    '["Produits frais et dressage soigné sur céramique et laiton","Brigade de maîtres d''hôtel et serveurs expérimentés","Adaptation aux régimes spécifiques sur demande"]',
    '["Élaboration du menu et dégustation préparatoire","Dressage des buffets ou service à l''assiette","Vaisselle, verrerie, nappage et personnel de service"]',
    '["Fontaine à thé marocain et pâtisseries fines","Ateliers culinaires en direct (live cooking)","Pièce montée ou wedding cake"]',
    '/src/assets/images/service_catering_buffet_1795278181357.jpg',
    NULL, 'Tarif sur devis', 1, 1, 7
  ),
  (
    8, 6, 'location-salles',
    'Location de salles & Lieux',
    'كراء القاعات والفضاءات',
    'Sélection de villas privées, domaines à Bouskoura, terrasses sur la Corniche et salons hôteliers.',
    'Nous vous ouvrons les portes de lieux adaptés à la taille et à l''esprit de votre réception : domaines arborés aux abords de Casablanca, villas contemporaines à Anfa et Dar Bouazza, rooftops panoramiques et salles de réception modulables.',
    '["Visites privées organisées selon vos disponibilités","Vérification des accès, stationnements et capacités acoustiques","Négociation directe des conditions de privatisation"]',
    '["Proposition ciblée de 3 à 5 lieux disponibles à votre date","Accompagnement lors des repérages techniques","Coordination avec la direction du lieu"]',
    '["Tentes caïdales et structures cristallines de jardin","Groupe électrogène silencieux","Chauffages de terrasse ou brumisateurs"]',
    '/src/assets/images/hero_casablanca_event_1795278178624.jpg',
    NULL, 'Tarif sur devis', 1, 1, 8
  ),
  (
    9, 6, 'photographie-videographie',
    'Photographie & Vidéographie',
    'التصوير الفوتوغرافي والفيديو',
    'Reportages éditoriaux intemporels, films en haute définition et couverture discrète de vos moments forts.',
    'Nos photographes et vidéastes privilégient une lumière naturelle, des cadrages soignés et une direction discrète pour capturer l''émotion authentique de votre mariage, cérémonie ou conférence d''entreprise.',
    '["Rendu éditorial naturel sans retouches artificielles","Livraison sécurisée sur galerie privée en ligne","Double prise de vue disponible pour les grands événements"]',
    '["Couverture complète selon la durée convenue","Sélection et étalonnage professionnel des photographies","Film récapitulatif monté en haute définition"]',
    '["Prise de vue aérienne par drone autorisé","Album d''art relié lin","Livraison express sous 48h pour événements corporate"]',
    '/src/assets/images/category_moroccan_wedding_1795278178133.jpg',
    NULL, 'Tarif sur devis', 1, 0, 9
  ),
  (
    10, 6, 'sonorisation-eclairage-dj',
    'Sonorisation, Éclairage & DJ',
    'الصوت والإضاءة والدي جي',
    'Systèmes audio professionnels, mise en lumière architecturale et programmation DJ ou orchestre.',
    'Une acoustique claire pour vos discours et une ambiance musicale progressive pour vos soirées. Nous fournissons des enceintes discrètes, micros sans fil fiables, éclairages architecturaux chauds et DJ ou musiciens sélectionnés.',
    '["Matériel testé en amont et technicien dédié sur place","Éclairage chaleureux valorisant la décoration et la photographie","Programmation musicale personnalisée avant l''événement"]',
    '["Système son adapté à la jauge et à l''acoustique du lieu","Mise en lumière d''ambiance et projecteurs architecturaux","DJ animateur ou régie technique continue"]',
    '["Orchestre marocain ou oriental","Quartet acoustique pour cocktail","Écran LED haute définition pour conférence"]',
    '/src/assets/images/gallery_sound_lighting_1795278181682.jpg',
    NULL, 'Tarif sur devis', 1, 1, 10
  ),
  (
    11, 6, 'location-mobilier-equipement',
    'Location de mobilier & Accessoires',
    'كراء الأثاث والمعدات',
    'Tables de banquet, assises design, salons lounge, estrades, vaisselle et accessoires de réception.',
    'Complétez votre réception avec un parc de mobilier entretenu avec soin : tables rectangulaires en chêne, chaises médaillon ou transparentes, salons bas en lin, pupitres de conférence, parasols et arts de la table coordonnés.',
    '["Matériel inspecté et nettoyé avant chaque livraison","Livraison, installation et reprise ponctuelles sur le Grand Casablanca","Cohérence esthétique avec la scénographie globale"]',
    '["Mise à disposition du mobilier sélectionné pour la durée de l''événement","Transport aller-retour sur Casablanca et périphérie","Installation selon le plan de salle validé"]',
    '["Piste de danse sur mesure","Tapis d''accueil et potelets de guidage","Climatisation mobile ou parasols chauffants"]',
    '/src/assets/images/service_floral_decor_1795278181542.jpg',
    NULL, 'Tarif sur devis', 1, 0, 11
  );

INSERT OR IGNORE INTO gallery_images (id, title_fr, caption_fr, category, image_url, sort_order, is_featured) VALUES
  (1, 'Dîner de gala face à l''Atlantique', 'Terrasse illuminée à la bougie sur la Corniche de Casablanca pour 180 convives.', 'Mariages', '/src/assets/images/hero_casablanca_event_1795278178624.jpg', 1, 1),
  (2, 'Réception florale sous arches ivoire', 'Salon de mariage habillé de draperies lin, arches de roses blanches et luminaires en laiton.', 'Mariages', '/src/assets/images/category_moroccan_wedding_1795278178133.jpg', 2, 1),
  (3, 'Soirée d''entreprise à Casablanca', 'Atrium architectural aménagé pour un séminaire annuel avec dîner assis et scène boisée.', 'Événements professionnels', '/src/assets/images/category_corporate_gala_1795278181060.jpg', 3, 1),
  (4, 'Cérémonie de henné traditionnelle', 'Salon brodé ivoire et or, plateaux ciselés et compositions de fleurs d''oranger.', 'Cérémonies marocaines', '/src/assets/images/category_henna_ceremony_1795278182712.jpg', 4, 1),
  (5, 'Table gastronomique marocaine et méditerranéenne', 'Dressage sur travertin mêlant cuisine marocaine raffinée, pâtisseries fines et fruits de saison.', 'Traiteur', '/src/assets/images/service_catering_buffet_1795278181357.jpg', 5, 1),
  (6, 'Arts de la table et bouquet champêtre', 'Porcelaine bord doré, couverts brossés, linge de lin et roses de jardin blanches.', 'Décoration', '/src/assets/images/service_floral_decor_1795278181542.jpg', 6, 1),
  (7, 'Anniversaire privé en jardin à Anfa', 'Grande tablée en bois massif sous suspensions chaudes au cœur d''un jardin méditerranéen.', 'Anniversaires', '/src/assets/images/gallery_birthday_garden_1795278181192.jpg', 7, 1),
  (8, 'Scénographie lumineuse et espace DJ', 'Console sur mesure en noyer et laiton avec éclairage architectural ambré pour soirée privée.', 'Fêtes privées', '/src/assets/images/gallery_sound_lighting_1795278181682.jpg', 8, 1),
  (9, 'Allée de cérémonie sous arche florale', 'Arche asymétrique de roses blanches et rameaux d''olivier bordée de bougies à Casablanca.', 'Mariages', '/src/assets/images/masonry_wedding_arch_1795278960981.jpg', 9, 1),
  (10, 'Soirée aux chandelles et arts de la table', 'Candélabres en laiton brossé, coupes en cristal et dîner de gala intimiste.', 'Fêtes privées', '/src/assets/images/masonry_evening_soir_e_1795278961707.jpg', 10, 1),
  (11, 'Sommet exécutif & conférence annuelle', 'Scène boisée avec éclairage architectural et régie audiovisuelle pour conférence d''entreprise.', 'Événements professionnels', '/src/assets/images/masonry_corporate_keynote_1795278962003.jpg', 11, 1);

INSERT OR IGNORE INTO testimonials (id, client_name, event_type, event_date_label, quote_fr, rating, is_demo, is_published, sort_order) VALUES
  (1, 'Salma & Youssef B. (Témoignage de démonstration)', 'Mariage à Anfa, Casablanca · 240 invités', 'Automne 2025', 'L''équipe EVENT PRO a transformé nos préparatifs en une expérience sereine. Chaque prestataire était coordonné au millimètre près et la décoration florale dépassait nos attentes.', 5, 1, 1, 1),
  (2, 'Karim M., Direction Communication (Témoignage de démonstration)', 'Séminaire annuel · Casablanca Finance City', 'Printemps 2026', 'De la recherche de la salle à la régie audiovisuelle et au cocktail déjeunatoire, tout a été livré à l''heure avec un suivi budgétaire transparent en dirhams.', 5, 1, 1, 2),
  (3, 'Nadia E. (Témoignage de démonstration)', 'Soirée Henné & Fiançailles · Californie, Casablanca', 'Été 2025', 'Un équilibre rare entre tradition marocaine et sobriété contemporaine. Nos familles ont particulièrement apprécié la qualité de l''accueil et la discrétion de l''équipe.', 5, 1, 1, 3);

-- Sample realistic pipeline records so Admin Dashboard has immediate operational data
INSERT OR IGNORE INTO customers (id, full_name, email, phone, whatsapp, preferred_contact, city, company_name) VALUES
  (1, 'Kenza Tazi', 'kenza.tazi@exemple.ma', '+212 6 61 00 00 01', '+212661000001', 'whatsapp', 'Casablanca', ''),
  (2, 'Mehdi Bennani', 'm.bennani@atlas-conseil.ma', '+212 6 61 00 00 02', '+212661000002', 'email', 'Casablanca', 'Atlas Conseil Maroc');

INSERT OR IGNORE INTO bookings (
  id, reference_code, customer_id, event_type, event_title, event_date, preferred_time,
  event_location, venue_choice, guest_count, event_duration, estimated_budget,
  preferred_style, color_theme, special_requirements, additional_notes,
  full_name, email, phone, whatsapp, preferred_contact, status, assigned_to
) VALUES
  (
    1, 'EP-RES-20261121-1042', 1, 'Mariage', 'Mariage Kenza & Omar', '2026-06-20', '19:30',
    'Anfa / Ain Diab, Casablanca', 'Villa ou terrasse vue océan', 220, 'Soirée complète (19h - 03h)',
    'Plus de 50 000 MAD', 'Luxe contemporain & touches marocaines', 'Ivoire, Champagne & Vert olive',
    'Espace cérémonie henné la veille souhaité', 'Souhaite visiter 3 lieux courant décembre.',
    'Kenza Tazi', 'kenza.tazi@exemple.ma', '+212 6 61 00 00 01', '+212661000001', 'whatsapp', 'En cours d''étude', 'Direction Artistique'
  ),
  (
    2, 'EP-RES-20261121-1089', 2, 'Événement professionnel', 'Conférence Annuelle & Dîner de Gala', '2026-04-14', '09:00',
    'Casablanca Finance City', 'Salle de conférence + atrium dîner', 140, 'Journée complète + soirée',
    '20 000 à 50 000 MAD', 'Épuré corporate', 'Charbon, Blanc & Or brossé',
    'Écran LED, 4 micros HF et traduction simultanée', 'Besoin d''un devis structuré pour validation financière.',
    'Mehdi Bennani', 'm.bennani@atlas-conseil.ma', '+212 6 61 00 00 02', '+212661000002', 'email', 'Devis envoyé', 'Pôle Corporate'
  );

INSERT OR IGNORE INTO quotes (
  id, reference_code, booking_id, customer_id, event_type, event_date, event_location,
  guest_count, requested_services_json, budget_range, details,
  client_name, client_email, client_phone, status, subtotal_mad, discount_mad, total_mad, valid_until
) VALUES
  (
    1, 'EP-DEV-20261121-2015', 2, 2, 'Événement professionnel', '2026-04-14', 'Casablanca Finance City',
    140, '["Organisation complète","Sonorisation & Éclairage","Traiteur & Buffet","Photographie & Vidéographie"]',
    '20 000 à 50 000 MAD', 'Séminaire journée complète avec pauses café, déjeuner et dîner assis.',
    'Mehdi Bennani', 'm.bennani@atlas-conseil.ma', '+212 6 61 00 00 02', 'Devis envoyé',
    44000, 2000, 42000, '2026-12-30'
  );

INSERT OR IGNORE INTO quote_items (id, quote_id, service_id, description, quantity, unit_price_mad, line_total_mad, sort_order) VALUES
  (1, 1, 4, 'Coordination globale & régie séminaire (140 participants)', 1, 12000, 12000, 1),
  (2, 1, 7, 'Traiteur : accueil café, déjeuner d''affaires & dîner assis', 140, 180, 25200, 2),
  (3, 1, 10, 'Régie audiovisuelle, sonorisation conférence & éclairage dîner', 1, 6800, 6800, 3);

INSERT OR IGNORE INTO contact_messages (id, name, email, phone, subject, message, status) VALUES
  (1, 'Amina Berrada', 'amina.berrada@exemple.ma', '+212 6 62 00 00 10', 'Demande de disponibilité pour fiançailles en mai', 'Bonjour, nous souhaitons organiser des fiançailles pour environ 80 personnes à Bouskoura au mois de mai. Quelles sont vos disponibilités pour un premier rendez-vous ?', 'unread');
