/*
  # Seed Initial Data

  1. Create default users
  2. Create default hazards and control measures
  3. Create default criteria categories
  4. Create sample risk assessments
*/

-- Insert default users (passwords will be handled by Supabase Auth)
INSERT INTO users (id, email, name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@gbu-app.de', 'System Administrator', 'ADMIN'),
  ('550e8400-e29b-41d4-a716-446655440002', 'projektleiter@gbu-app.de', 'Max Mustermann', 'PROJEKTLEITER'),
  ('550e8400-e29b-41d4-a716-446655440003', 'mitarbeiter@gbu-app.de', 'Lisa Musterfrau', 'MITARBEITER')
ON CONFLICT (email) DO NOTHING;

-- Insert default hazards
INSERT INTO hazards (id, title, description, category, default_likelihood, default_severity, legal_refs) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'Elektrische Gefährdung', 'Stromschlag durch defekte oder unsachgemäß verwendete Elektrogeräte', 'ELEKTRIK', 2, 5, 'DGUV Vorschrift 3, VDE 0100'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Absturzgefahr', 'Sturz von erhöhten Arbeitsplätzen oder Bühnen', 'HOEHE', 3, 5, 'DGUV Regel 112-198, PSAgA'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Wetter und Unwetter', 'Gefährdung durch Wind, Regen, Blitz bei Outdoor-Veranstaltungen', 'WETTER', 4, 4, 'DIN EN 13782'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Kohlenmonoxid-Vergiftung', 'CO-Vergiftung durch Generatoren oder Heizgeräte', 'CHEMISCH', 2, 5, 'TRGS 900'),
  ('550e8400-e29b-41d4-a716-446655440014', 'Fahrzeugverkehr', 'Gefährdung durch rangierende oder fahrende Fahrzeuge', 'VERKEHR', 3, 4, 'StVO, DGUV Regel 114-016'),
  ('550e8400-e29b-41d4-a716-446655440015', 'Lärmbelastung', 'Gehörschädigung durch hohe Schallpegel', 'LAERM', 4, 3, 'LärmVibrationsArbSchV'),
  ('550e8400-e29b-41d4-a716-446655440016', 'Brandgefahr', 'Brand durch elektrische Geräte, Pyrotechnik oder offenes Feuer', 'BRAND', 2, 5, 'Versammlungsstättenverordnung'),
  ('550e8400-e29b-41d4-a716-446655440017', 'Stolper- und Sturzgefahr', 'Verletzungen durch Kabel, unebenen Untergrund oder Hindernisse', 'MECHANISCH', 4, 2, 'DGUV Information 208-016')
ON CONFLICT (id) DO NOTHING;

-- Insert control measures
INSERT INTO control_measures (hazard_id, description, type, mandatory) VALUES
  -- Elektrische Gefährdung
  ('550e8400-e29b-41d4-a716-446655440010', 'Prüfung der elektrischen Anlagen durch Elektrofachkraft', 'TECHNISCH', true),
  ('550e8400-e29b-41d4-a716-446655440010', 'Verwendung von FI-Schutzschaltern', 'TECHNISCH', true),
  ('550e8400-e29b-41d4-a716-446655440010', 'Unterweisung im Umgang mit elektrischen Geräten', 'ORGANISATORISCH', true),
  
  -- Absturzgefahr
  ('550e8400-e29b-41d4-a716-446655440011', 'Absturzsicherungen (Geländer, Netze)', 'TECHNISCH', true),
  ('550e8400-e29b-41d4-a716-446655440011', 'Persönliche Schutzausrüstung gegen Absturz', 'PPE', true),
  ('550e8400-e29b-41d4-a716-446655440011', 'Unterweisung in Höhenarbeit', 'ORGANISATORISCH', true),
  
  -- Wetter und Unwetter
  ('550e8400-e29b-41d4-a716-446655440012', 'Wetterüberwachung und Frühwarnsystem', 'ORGANISATORISCH', true),
  ('550e8400-e29b-41d4-a716-446655440012', 'Windlastberechnungen für Aufbauten', 'TECHNISCH', true),
  ('550e8400-e29b-41d4-a716-446655440012', 'Blitzschutzkonzept', 'TECHNISCH', false),
  
  -- Kohlenmonoxid-Vergiftung
  ('550e8400-e29b-41d4-a716-446655440013', 'Aufstellung von Generatoren im Freien oder gut belüfteten Bereichen', 'ORGANISATORISCH', true),
  ('550e8400-e29b-41d4-a716-446655440013', 'CO-Warnmelder installieren', 'TECHNISCH', true),
  ('550e8400-e29b-41d4-a716-446655440013', 'Regelmäßige Wartung der Verbrennungsgeräte', 'ORGANISATORISCH', true),
  
  -- Fahrzeugverkehr
  ('550e8400-e29b-41d4-a716-446655440014', 'Verkehrswege markieren und absperren', 'ORGANISATORISCH', true),
  ('550e8400-e29b-41d4-a716-446655440014', 'Einweiser beim Rangieren einsetzen', 'ORGANISATORISCH', true),
  ('550e8400-e29b-41d4-a716-446655440014', 'Warnwesten tragen', 'PPE', true),
  
  -- Lärmbelastung
  ('550e8400-e29b-41d4-a716-446655440015', 'Gehörschutz bereitstellen', 'PPE', true),
  ('550e8400-e29b-41d4-a716-446655440015', 'Schallpegelmessungen durchführen', 'ORGANISATORISCH', true),
  ('550e8400-e29b-41d4-a716-446655440015', 'Arbeitszeiten bei hohem Lärmpegel begrenzen', 'ORGANISATORISCH', false),
  
  -- Brandgefahr
  ('550e8400-e29b-41d4-a716-446655440016', 'Feuerlöscher bereitstellen', 'TECHNISCH', true),
  ('550e8400-e29b-41d4-a716-446655440016', 'Brandschutzordnung erstellen', 'ORGANISATORISCH', true),
  ('550e8400-e29b-41d4-a716-446655440016', 'Rauchverbot in kritischen Bereichen', 'ORGANISATORISCH', true),
  
  -- Stolper- und Sturzgefahr
  ('550e8400-e29b-41d4-a716-446655440017', 'Kabelbrücken und Kabelkanäle verwenden', 'TECHNISCH', true),
  ('550e8400-e29b-41d4-a716-446655440017', 'Arbeitsplätze gut beleuchten', 'TECHNISCH', true),
  ('550e8400-e29b-41d4-a716-446655440017', 'Sicherheitsschuhe tragen', 'PPE', true)
ON CONFLICT DO NOTHING;

-- Insert default criteria categories
INSERT INTO criteria_categories (id, name, type, category, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440020', 'Outdoor-Veranstaltung', 'boolean', 'location', 'Veranstaltung findet im Freien statt'),
  ('550e8400-e29b-41d4-a716-446655440021', 'Elektrische Anlagen vorhanden', 'boolean', 'project', 'Projekt verwendet elektrische Anlagen'),
  ('550e8400-e29b-41d4-a716-446655440022', 'Generatoren/Notstromaggregate', 'boolean', 'project', 'Verwendung von Generatoren oder Notstromaggregaten'),
  ('550e8400-e29b-41d4-a716-446655440023', 'Arbeiten über 2m Höhe', 'boolean', 'project', 'Arbeiten in Höhen über 2 Meter'),
  ('550e8400-e29b-41d4-a716-446655440024', 'Publikumsverkehr', 'boolean', 'project', 'Veranstaltung mit Publikumszugang'),
  ('550e8400-e29b-41d4-a716-446655440025', 'Nachtarbeit', 'boolean', 'project', 'Arbeiten während der Nachtzeit'),
  ('550e8400-e29b-41d4-a716-446655440026', 'Verkehrsflächen betroffen', 'boolean', 'project', 'Beeinträchtigung von Verkehrswegen'),
  ('550e8400-e29b-41d4-a716-446655440027', 'Gefahrstoffe', 'boolean', 'project', 'Verwendung von Gefahrstoffen')
ON CONFLICT (id) DO NOTHING;

-- Insert sample risk assessments
INSERT INTO risk_assessments (
  id, activity, process, hazard, hazard_factors, severity, probability, risk_value,
  substitution, technical, organizational, personal, measures,
  severity_after, probability_after, residual_risk, group_name, auto_select
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440030',
    'Elektrische Arbeiten',
    'Installation und Wartung',
    'Stromschlag',
    'Defekte Kabel, Feuchtigkeit, unsachgemäße Handhabung',
    5, 3, 15,
    false, true, true, true,
    'FI-Schutzschalter, Prüfung durch Elektrofachkraft, Isolierte Werkzeuge',
    5, 1, 5,
    'Elektrik',
    '{"hasElectricity": true}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440031',
    'Arbeiten in der Höhe',
    'Rigging und Montage',
    'Absturz',
    'Ungesicherte Arbeitsplätze, defekte Ausrüstung',
    5, 3, 15,
    false, true, true, true,
    'Absturzsicherung, PSA gegen Absturz, Unterweisung',
    5, 1, 5,
    'Höhenarbeit',
    '{"hasWorkAbove2m": true}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440032',
    'Generatorbetrieb',
    'Stromversorgung',
    'Kohlenmonoxid-Vergiftung',
    'Abgase in geschlossenen Räumen',
    5, 2, 10,
    true, true, true, false,
    'Aufstellung im Freien, CO-Warnmelder, Belüftung',
    5, 1, 5,
    'Generatoren',
    '{"hasGenerator": true}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440033',
    'Outdoor-Veranstaltung',
    'Aufbau und Durchführung',
    'Wettergefährdung',
    'Wind, Regen, Blitz, Temperaturschwankungen',
    4, 4, 16,
    false, true, true, false,
    'Wetterüberwachung, Windlastberechnungen, Blitzschutz',
    4, 2, 8,
    'Wetter',
    '{"isOutdoor": true, "season": ["Frühling", "Sommer", "Herbst", "Winter"]}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;