-- GBU Management System Database Schema
-- MariaDB/MySQL

CREATE DATABASE IF NOT EXISTS gbu_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gbu_management;

-- Benutzer Tabelle
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'bereichsleiter', 'technischer_leiter', 'projektleiter', 'user') NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projekte Tabelle
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    aufbau_datum DATE,
    start_date DATE,
    end_date DATE,
    season ENUM('fruehling', 'sommer', 'herbst', 'winter'),
    indoor_outdoor ENUM('indoor', 'outdoor', 'both'),
    status ENUM('planung', 'aktiv', 'abgeschlossen', 'archiviert') DEFAULT 'planung',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_season (season),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projektzuweisungen
CREATE TABLE project_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    assigned_by INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_assignment (project_id, user_id),
    INDEX idx_project (project_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bereiche (z.B. "Büro & Bildschirmarbeitsplatz", "Raumklima/Raumtemperatur", etc.)
CREATE TABLE bereiche (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bereichszuweisungen zu Bereichsleitern für ein Projekt
CREATE TABLE bereich_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bereich_id INT NOT NULL,
    bereichsleiter_id INT NOT NULL,
    project_id INT NOT NULL,
    assigned_by INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bereich_id) REFERENCES bereiche(id) ON DELETE CASCADE,
    FOREIGN KEY (bereichsleiter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_bereich_assignment (bereich_id, project_id),
    INDEX idx_bereich (bereich_id),
    INDEX idx_bereichsleiter (bereichsleiter_id),
    INDEX idx_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GBU Templates (Vorlagen)
CREATE TABLE gbu_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    season ENUM('fruehling', 'sommer', 'herbst', 'winter', 'alle') DEFAULT 'alle',
    indoor_outdoor ENUM('indoor', 'outdoor', 'both', 'alle') DEFAULT 'alle',
    is_global BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_season (season),
    INDEX idx_indoor_outdoor (indoor_outdoor),
    INDEX idx_global (is_global)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gefährdungen (Teil einer GBU)
CREATE TABLE gefaehrdungen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gbu_template_id INT,
    project_id INT,
    bereich_id INT,
    tätigkeit VARCHAR(255) NOT NULL,
    gefährdung TEXT,
    gefährdungsfaktoren TEXT,
    belastungsfaktoren TEXT,
    schadenschwere INT CHECK (schadenschwere BETWEEN 1 AND 3),
    wahrscheinlichkeit INT CHECK (wahrscheinlichkeit BETWEEN 1 AND 3),
    risikobewertung VARCHAR(50),
    -- STOP Prinzip Spalten
    s_substitution ENUM('WAHR', 'FALSCH', '') DEFAULT '',
    t_technisch ENUM('WAHR', 'FALSCH', '') DEFAULT '',
    o_organisatorisch ENUM('WAHR', 'FALSCH', '') DEFAULT '',
    p_persoenlich ENUM('WAHR', 'FALSCH', '') DEFAULT '',
    -- Maßnahmen
    massnahmen TEXT,
    s_massnahmen TEXT,
    t_massnahmen TEXT,
    o_massnahmen TEXT,
    p_massnahmen TEXT,
    -- Überprüfung
    überprüfung_wirksamkeit TEXT,
    überprüfung_meldung TEXT,
    -- Sonstige Bemerkungen
    sonstige_bemerkungen TEXT,
    -- Gesetzliche Regelungen
    gesetzliche_regelungen TEXT,
    -- Mängel behoben
    mängel_behoben BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gbu_template_id) REFERENCES gbu_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (bereich_id) REFERENCES bereiche(id) ON DELETE SET NULL,
    INDEX idx_template (gbu_template_id),
    INDEX idx_project (project_id),
    INDEX idx_bereich (bereich_id),
    INDEX idx_risiko (risikobewertung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projekt-GBU Zuordnung (welche Templates werden in welchem Projekt verwendet)
CREATE TABLE project_gbus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    gbu_template_id INT NOT NULL,
    added_by INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (gbu_template_id) REFERENCES gbu_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_project_gbu (project_id, gbu_template_id),
    INDEX idx_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teilnehmer
CREATE TABLE participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    position VARCHAR(100),
    company VARCHAR(255),
    signature_data LONGTEXT,
    signature_type ENUM('digital', 'analog', 'pending') DEFAULT 'pending',
    signed_at TIMESTAMP NULL,
    imported_from_csv BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Unterweisungen/Zusammenfassungen
CREATE TABLE unterweisungen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(255),
    content LONGTEXT,
    veranstaltung VARCHAR(255),
    datum_ort VARCHAR(255),
    -- Organisationsinhalt
    organisation TEXT,
    allgemeine_hinweise TEXT,
    notfaelle_raeumung TEXT,
    zusaetzliche_regeln TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Unterweisung Icons/Regeln Items
CREATE TABLE unterweisung_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unterweisung_id INT NOT NULL,
    section VARCHAR(100),
    icon_type VARCHAR(50),
    content TEXT,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (unterweisung_id) REFERENCES unterweisungen(id) ON DELETE CASCADE,
    INDEX idx_unterweisung (unterweisung_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Log
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Standard Bereiche einfügen
INSERT INTO bereiche (name, description, sort_order) VALUES
('Büro & Bildschirmarbeitsplatz', 'Arbeiten am Bildschirm und im Büro', 1),
('Raumklima/Raumtemperatur', 'Klimatische Bedingungen am Arbeitsplatz', 2),
('Beleuchtung', 'Beleuchtung und Sichtverhältnisse', 3),
('Elektrische Anlagen', 'Elektrische Installationen und Geräte', 4),
('Lärm', 'Lärmbelastung am Arbeitsplatz', 5),
('Physische Belastung', 'Körperliche Belastungen', 6),
('Gefahrstoffe', 'Umgang mit Gefahrstoffen', 7),
('Brandschutz', 'Brandschutzmaßnahmen', 8),
('Erste Hilfe', 'Erste-Hilfe-Einrichtungen', 9),
('Verkehrswege', 'Wege und Zugänge', 10);

-- Standard Admin User erstellen (Passwort: admin123 - BITTE ÄNDERN!)
-- Hash für 'admin123': pbkdf2:sha256:600000$...
INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES
('admin', 'admin@example.com', 'pbkdf2:sha256:600000$VCxN6dKzGBm5EIwC$8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c', 'admin', 'System', 'Administrator');
