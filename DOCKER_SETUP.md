# Docker Setup für GBU Management

Diese Anleitung erklärt, wie die GBU Management Anwendung mit Docker und PostgreSQL-Datenbank gestartet wird.

## 🐳 Voraussetzungen

- Docker Desktop (Version 20.10 oder höher)
- Docker Compose (Version 2.0 oder höher)

## 📋 Überblick

Das Docker-Setup besteht aus zwei Services:
- **db**: PostgreSQL 15 Datenbank
- **app**: Next.js Anwendung (GBU Management)

## 🚀 Schnellstart

### Produktiv-Umgebung starten

```bash
# Mit dem Start-Script
./start-docker.sh prod

# Oder direkt mit Docker Compose
docker compose up --build
```

Die Anwendung ist dann unter **http://localhost:3000** erreichbar.

### Entwicklungs-Umgebung starten

```bash
# Mit dem Start-Script
./start-docker.sh dev

# Oder direkt mit Docker Compose
docker compose -f docker-compose.dev.yml up --build
```

## 🔧 Konfiguration

### Datenbank-Zugangsdaten

**PostgreSQL Datenbank:**
- Host: `localhost` (von außerhalb) oder `db` (innerhalb Docker)
- Port: `5432`
- Datenbank: `gbu_app`
- Benutzer: `gbu_user`
- Passwort: `gbu_password_2024`

### Umgebungsvariablen

Die `.env` Datei wurde automatisch erstellt mit:

```env
DATABASE_URL="postgresql://gbu_user:gbu_password_2024@localhost:5432/gbu_app?schema=public"
NEXTAUTH_SECRET="Jg5QaXU8+VGFmQqjt+KrxfT2Hs7Lp9Mn3Bv6Cx1Zy4="
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

## 📊 Datenbank-Schema

Das Datenbank-Schema wird beim ersten Start automatisch erstellt durch:
- `npx prisma db push` - Synchronisiert das Prisma Schema mit der Datenbank

Das Schema umfasst folgende Tabellen:
- `users` - Benutzer mit Rollen (ADMIN, PROJEKTLEITER, MITARBEITER)
- `projects` - Veranstaltungsprojekte
- `hazards` - Gefährdungskatalog
- `project_hazards` - Projekt-spezifische Gefährdungen
- `control_measures` - Schutzmaßnahmen
- `participants` - Teilnehmer/Mitarbeiter
- `briefings` - Unterweisungen
- `signatures` - Unterschriften
- `attachments` - Dokumente
- `audit_logs` - Audit-Protokoll

## 🎯 Test-Benutzer

Nach dem Start können Sie sich mit folgenden Test-Accounts anmelden:

**Administrator:**
- Email: `admin@gbu-app.de`
- Passwort: `admin123`

**Projektleiter:**
- Email: `projektleiter@gbu-app.de`
- Passwort: `user123`

**Mitarbeiter:**
- Email: `mitarbeiter@gbu-app.de`
- Passwort: `user123`

## 📝 Nützliche Befehle

### Container-Verwaltung

```bash
# Logs anzeigen
./start-docker.sh logs
# oder
docker compose logs -f

# Container stoppen
./start-docker.sh stop
# oder
docker compose down

# Container stoppen und Volumes löschen
./start-docker.sh clean
# oder
docker compose down -v

# Nur Datenbank neu starten
docker compose restart db

# Nur App neu starten
docker compose restart app
```

### Datenbank-Befehle

```bash
# In den Container einloggen
docker exec -it gbu_postgres psql -U gbu_user -d gbu_app

# Datenbank-Backup erstellen
docker exec gbu_postgres pg_dump -U gbu_user gbu_app > backup.sql

# Datenbank-Backup wiederherstellen
docker exec -i gbu_postgres psql -U gbu_user gbu_app < backup.sql

# Datenbank-Schema neu synchronisieren (innerhalb des App-Containers)
docker exec -it gbu_app npx prisma db push
```

### Entwickler-Befehle

```bash
# Prisma Studio öffnen (Datenbank-GUI)
docker exec -it gbu_app npx prisma studio

# Neue Prisma-Migration erstellen
docker exec -it gbu_app npx prisma migrate dev --name beschreibung

# Prisma Client neu generieren
docker exec -it gbu_app npx prisma generate
```

## 🔍 Troubleshooting

### Problem: App startet nicht

**Lösung 1:** Prüfen Sie die Logs
```bash
docker compose logs app
```

**Lösung 2:** Datenbank-Verbindung prüfen
```bash
docker compose logs db
```

**Lösung 3:** Container neu bauen
```bash
docker compose down -v
docker compose up --build
```

### Problem: Datenbank-Verbindung schlägt fehl

**Lösung:** Warten Sie, bis die Datenbank vollständig gestartet ist
```bash
# Prüfen Sie den Status
docker compose ps

# Die DB sollte "healthy" sein
docker inspect gbu_postgres | grep -A 5 Health
```

### Problem: Port 3000 oder 5432 bereits belegt

**Lösung:** Ändern Sie die Ports in `docker-compose.yml`
```yaml
services:
  db:
    ports:
      - "5433:5432"  # Verwenden Sie Port 5433 statt 5432

  app:
    ports:
      - "3001:3000"  # Verwenden Sie Port 3001 statt 3000
```

### Problem: Änderungen am Code werden nicht übernommen

**Entwicklungs-Modus:** Die Änderungen sollten automatisch übernommen werden (Hot Reload)

**Produktiv-Modus:** Neu bauen erforderlich
```bash
docker compose up --build
```

## 📦 Persistente Daten

Die Daten werden in Docker Volumes gespeichert:

- `postgres_data` - PostgreSQL Datenbank (Produktion)
- `postgres_dev_data` - PostgreSQL Datenbank (Entwicklung)
- `app_data` - App-Daten
- `dev_data` - Entwicklungs-Daten

Diese Volumes bleiben erhalten, auch wenn die Container gelöscht werden.

Um alle Daten zu löschen:
```bash
docker compose down -v
```

## 🏗️ Architektur

```
┌─────────────────────────────────────┐
│         Browser (localhost:3000)    │
└─────────────────┬───────────────────┘
                  │
                  │ HTTP
                  │
┌─────────────────▼───────────────────┐
│         Next.js App Container       │
│                                     │
│  - Next.js 14                       │
│  - NextAuth (JWT)                   │
│  - Prisma Client                    │
│  - API Routes                       │
└─────────────────┬───────────────────┘
                  │
                  │ PostgreSQL Protocol
                  │
┌─────────────────▼───────────────────┐
│       PostgreSQL Container          │
│                                     │
│  - PostgreSQL 15                    │
│  - Database: gbu_app                │
│  - User: gbu_user                   │
└─────────────────────────────────────┘
```

## 🔐 Sicherheitshinweise

**Wichtig für Produktion:**

1. **Ändern Sie die Passwörter** in `docker-compose.yml` und `.env`
2. **Ändern Sie NEXTAUTH_SECRET** - Generieren Sie einen neuen Wert:
   ```bash
   openssl rand -base64 32
   ```
3. **Verwenden Sie HTTPS** in Produktion
4. **Setzen Sie sichere Datenbank-Passwörter**
5. **Beschränken Sie den Datenbank-Zugriff** (entfernen Sie den exponierten Port 5432 wenn nicht benötigt)

## 🆘 Support

Bei Problemen:
1. Prüfen Sie die Logs: `docker compose logs -f`
2. Prüfen Sie die Container-Status: `docker compose ps`
3. Starten Sie die Container neu: `docker compose restart`
4. Bauen Sie alles neu: `docker compose up --build --force-recreate`

## 📚 Weitere Dokumentation

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
