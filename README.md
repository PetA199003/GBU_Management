# GBU Management System

Gefährdungsbeurteilungs-Management-System für Produktionen und Veranstaltungen nach dem Hamburger Modell mit STOP-Prinzip.

![GBU Management](https://img.shields.io/badge/GBU-Management-blue)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MariaDB](https://img.shields.io/badge/MariaDB-10.5+-orange)

## Übersicht

Das GBU Management System ist eine vollständige Webanwendung zur Verwaltung von Gefährdungsbeurteilungen für Produktionen und Veranstaltungen. Es implementiert das **STOP-Prinzip** (Substitution, Technisch, Organisatorisch, Persönlich) nach dem **Hamburger Modell** und bietet umfassende Funktionen für die Erstellung, Verwaltung und Dokumentation von Gefährdungsbeurteilungen.

## Hauptmerkmale

### 🔐 Benutzerverwaltung
- **Rollensystem** mit 5 Rollen: Admin, Bereichsleiter, Technischer Leiter, Projektleiter, User
- Granulare Berechtigungen für verschiedene Funktionen
- Sichere JWT-basierte Authentifizierung

### 📋 Projektverwaltung
- Projekte mit detaillierten Informationen (Ort, Datum, Saison, Indoor/Outdoor)
- Automatische Saisonerkennung basierend auf Datum
- Benutzer- und Bereichszuweisung
- Status-Tracking (Planung, Aktiv, Abgeschlossen, Archiviert)

### ⚠️ Gefährdungsbeurteilungen (GBU)
- **STOP-Prinzip** nach Hamburger Modell
- Risikobewertung mit Schadenschwere und Wahrscheinlichkeit
- Farbcodierte Risikoanzeige (Grün, Gelb, Rot)
- Vordefinierte GBU-Vorlagen nach Saison und Indoor/Outdoor
- Bereichsspezifische Gefährdungen
- Wiederverwendbare Templates

### 👥 Teilnehmerverwaltung
- Manuelle Erfassung von Teilnehmern
- **CSV-Import** für massenhafte Teilnehmererfassung
- **Digitale Unterschriften** mit iPad-Support (Apple Pencil)
- Teilnehmerlisten als PDF

### 📄 Unterweisungen
- Automatische Generierung von Unterweisungen
- Standardisierte Struktur (Organisation, Hinweise, Notfälle)
- Anpassbare Inhalte
- PDF-Export

### 📊 PDF-Generierung
- GBU-Übersicht mit allen Gefährdungen
- Teilnehmerlisten mit Unterschriftenfeldern
- Unterweisungsdokumente
- Professionelles Layout mit ReportLab

## Technologie-Stack

### Backend
- **Python 3.11+** mit Flask
- **SQLAlchemy** für ORM
- **MariaDB** als Datenbank
- **Flask-JWT-Extended** für Authentifizierung
- **ReportLab** für PDF-Generierung
- **Pandas** für CSV-Verarbeitung

### Frontend
- **React 18** mit TypeScript
- **React Bootstrap** für UI-Komponenten
- **Axios** für API-Kommunikation
- **React Router** für Navigation
- **Signature Pad** für digitale Unterschriften

## Installation

### Schnellstart mit Setup-Skript (Linux/Mac)

```bash
chmod +x setup.sh
./setup.sh
```

Das Skript führt Sie durch die Installation und richtet automatisch ein:
- Python Virtual Environment
- Node.js Dependencies
- Datenbank (optional)
- Konfigurationsdateien

### Manuelle Installation

Detaillierte Installationsanweisungen finden Sie in [INSTALL.md](INSTALL.md).

#### Kurzübersicht

1. **Voraussetzungen installieren**
   - Python 3.11+
   - Node.js 18+
   - MariaDB 10.5+

2. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd GBU_Management
   ```

3. **Datenbank einrichten**
   ```bash
   mysql -u root -p
   CREATE DATABASE gbu_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'gbu_user'@'localhost' IDENTIFIED BY 'IhrPasswort';
   GRANT ALL PRIVILEGES ON gbu_management.* TO 'gbu_user'@'localhost';
   EXIT;

   mysql -u gbu_user -p gbu_management < database/schema.sql
   ```

4. **Backend einrichten**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   # .env bearbeiten und Datenbankverbindung anpassen
   ```

5. **Frontend einrichten**
   ```bash
   cd frontend
   npm install
   ```

## Verwendung

### Entwicklungsumgebung

**Backend starten:**
```bash
cd backend
source venv/bin/activate
python app.py
```
Backend läuft auf http://localhost:5000

**Frontend starten:**
```bash
cd frontend
npm start
```
Frontend läuft auf http://localhost:3000

### Standard-Zugangsdaten

- **Benutzername:** admin
- **Passwort:** admin123

⚠️ **WICHTIG:** Ändern Sie das Passwort sofort nach der ersten Anmeldung!

### Produktionsumgebung

Für Produktions-Deployment siehe [INSTALL.md](INSTALL.md). Empfohlene Konfiguration:
- Gunicorn als WSGI-Server
- Nginx als Reverse Proxy
- SSL/TLS mit Let's Encrypt
- Systemd für Service-Management

## Dokumentation

- **[INSTALL.md](INSTALL.md)** - Detaillierte Installationsanleitung
- **[BENUTZERHANDBUCH.md](BENUTZERHANDBUCH.md)** - Umfassendes Benutzerhandbuch
- **[API Documentation]** - (siehe Backend-Code für API-Endpoints)

## Projektstruktur

```
GBU_Management/
├── backend/                 # Flask Backend
│   ├── routes/             # API Routes
│   ├── utils/              # Hilfsfunktionen (PDF-Generator, etc.)
│   ├── models.py           # Datenbankmodelle
│   ├── config.py           # Konfiguration
│   ├── app.py              # Hauptanwendung
│   └── requirements.txt    # Python-Abhängigkeiten
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/    # React-Komponenten
│   │   ├── services/      # API-Services
│   │   ├── types.ts       # TypeScript-Typen
│   │   └── App.tsx        # Hauptkomponente
│   └── package.json       # Node.js-Abhängigkeiten
├── database/              # Datenbankschema
│   └── schema.sql         # SQL-Schema
├── setup.sh               # Automatisches Setup-Skript
├── INSTALL.md             # Installationsanleitung
├── BENUTZERHANDBUCH.md    # Benutzerhandbuch
└── README.md              # Diese Datei
```

## Benutzerrollen und Berechtigungen

| Rolle | Projektverwaltung | GBU erstellen | Bereiche zuweisen | Benutzerverwaltung | Nur Lesen |
|-------|------------------|---------------|-------------------|-------------------|-----------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Technischer Leiter** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Projektleiter** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Bereichsleiter** | ❌ | ✅ (eigener Bereich) | ❌ | ❌ | ✅ |
| **User** | ❌ | ❌ | ❌ | ❌ | ✅ |

## Workflow-Beispiel

1. **Admin** erstellt Benutzer (Technischer Leiter, Projektleiter, Bereichsleiter)
2. **Projektleiter** erstellt ein neues Projekt mit Datum und Ort
3. **Technischer Leiter** weist Bereichsleiter zu relevanten Bereichen zu
4. **Bereichsleiter** erstellen Gefährdungsbeurteilungen für ihre Bereiche
5. **Projektleiter** importiert Teilnehmerliste (CSV)
6. **Vor Ort:** Teilnehmer unterschreiben digital (iPad)
7. **Technischer Leiter** generiert Unterweisung und exportiert alle PDFs
8. **Admin** archiviert abgeschlossenes Projekt

## Features im Detail

### STOP-Prinzip

Das System implementiert das hierarchische STOP-Prinzip:

```
┌─────────────────────────────────┐
│  S - Substitution               │ ← Höchste Priorität
│  (Gefahren beseitigen)          │
├─────────────────────────────────┤
│  T - Technische Maßnahmen       │
│  (Technische Lösungen)          │
├─────────────────────────────────┤
│  O - Organisatorische Maßnahmen │
│  (Organisatorische Lösungen)    │
├─────────────────────────────────┤
│  P - Persönliche Schutzausrüstung│ ← Niedrigste Priorität
│  (PSA als letztes Mittel)       │
└─────────────────────────────────┘
```

### Risikobewertung

Risiko = Schadenschwere × Wahrscheinlichkeit

| Wert | Farbe | Bedeutung |
|------|-------|-----------|
| 1-2 | 🟢 Grün | Niedriges Risiko |
| 3-4 | 🟡 Gelb | Mittleres Risiko |
| 6-9 | 🔴 Rot | Hohes Risiko |

## Sicherheit

- JWT-basierte Authentifizierung mit Refresh-Tokens
- Passwort-Hashing mit bcrypt
- Role-Based Access Control (RBAC)
- SQL-Injection-Schutz durch SQLAlchemy ORM
- CORS-Schutz
- Input-Validierung

## Backup und Wartung

### Datenbank-Backup

```bash
mysqldump -u gbu_user -p gbu_management > backup_$(date +%Y%m%d).sql
```

### Automatisches Backup (Cron)

```bash
# Täglich um 2 Uhr
0 2 * * * mysqldump -u gbu_user -pPASSWORT gbu_management > /backup/gbu_$(date +\%Y\%m\%d).sql
```

## Troubleshooting

Siehe [INSTALL.md](INSTALL.md) für häufige Probleme und Lösungen.

## Entwicklung

### API-Endpoints

Die Backend-API ist RESTful und unter `/api` verfügbar:

- `/api/auth/*` - Authentifizierung
- `/api/users/*` - Benutzerverwaltung
- `/api/projects/*` - Projektverwaltung
- `/api/bereiche/*` - Bereichsverwaltung
- `/api/gbu/*` - Gefährdungsbeurteilungen
- `/api/participants/*` - Teilnehmerverwaltung
- `/api/unterweisung/*` - Unterweisungen
- `/api/pdf/*` - PDF-Generierung

## Lizenz

Proprietary - Alle Rechte vorbehalten

## Kontakt

Bei Fragen oder Support erstellen Sie bitte ein Issue im GitHub-Repository.

## Danksagung

Dieses System wurde entwickelt zur Vereinfachung der Gefährdungsbeurteilung bei Produktionen und Veranstaltungen nach den Standards des Hamburger Modells und unter Berücksichtigung der gesetzlichen Anforderungen für Arbeitssicherheit.
