# 🚀 Lightweight Setup - Für Systeme mit wenig RAM

Dieses Setup ist optimiert für Server/Systeme mit **wenig Arbeitsspeicher** (< 4GB RAM).

## ✨ Vorteile

- ✅ **Kein npm install im Docker** - spart RAM
- ✅ **Kein Build-Prozess** - schneller Start
- ✅ **Nur ~500MB RAM** benötigt (statt 4-6GB)
- ✅ **Nur Datenbank in Docker** - App nutzt Host-Dependencies

## 📋 Voraussetzungen

Auf dem Host-System installiert:
- Node.js 18+ ([Download](https://nodejs.org/))
- Docker & Docker Compose
- Git

## 🚀 Schnellstart

### 1. Setup ausführen (einmalig)

```bash
# Dependencies lokal installieren
./setup.sh
```

Das Script installiert:
- NPM Dependencies (lokal auf dem Host)
- Prisma Client

### 2. Starten

```bash
# Alles starten (Datenbank + App)
docker-compose -f docker-compose.lightweight.yml up -d
```

### 3. Öffnen

Die App läuft unter: **http://localhost:3003**

## 📊 Systemanforderungen

| Komponente | RAM | Disk |
|------------|-----|------|
| PostgreSQL | ~100MB | ~50MB |
| Node.js App | ~400MB | ~500MB |
| **Total** | **~500MB** | **~550MB** |

## 🔧 Wie es funktioniert

```
┌─────────────────────────────────┐
│  Host-System                     │
│  ┌───────────────────────────┐  │
│  │  node_modules/            │  │  ← Lokal installiert
│  │  (Dependencies)           │  │
│  └───────────────────────────┘  │
│           │ (gemountet)          │
│           ▼                      │
│  ┌───────────────────────────┐  │
│  │  Docker Container         │  │
│  │  ┌─────────────────────┐  │  │
│  │  │  Next.js App        │  │  │  ← Nutzt gemountete deps
│  │  │  (Development)      │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌───────────────────────────┐  │
│  │  PostgreSQL Container     │  │  ← Nur DB in Docker
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## 📝 Nützliche Befehle

### Status prüfen
```bash
docker-compose -f docker-compose.lightweight.yml ps
```

### Logs anzeigen
```bash
# Alle Logs
docker-compose -f docker-compose.lightweight.yml logs -f

# Nur App
docker-compose -f docker-compose.lightweight.yml logs -f app

# Nur DB
docker-compose -f docker-compose.lightweight.yml logs -f db
```

### Stoppen
```bash
docker-compose -f docker-compose.lightweight.yml down
```

### Neu starten
```bash
docker-compose -f docker-compose.lightweight.yml restart
```

### Datenbank zurücksetzen
```bash
docker-compose -f docker-compose.lightweight.yml down -v
docker-compose -f docker-compose.lightweight.yml up -d
```

## 🔍 Troubleshooting

### Problem: "Cannot find module"

**Lösung:** Setup erneut ausführen
```bash
./setup.sh
```

### Problem: Prisma-Fehler

**Lösung:** Prisma Client neu generieren
```bash
npx prisma generate
docker-compose -f docker-compose.lightweight.yml restart app
```

### Problem: Datenbank-Verbindung schlägt fehl

**Lösung:** Warten bis DB bereit ist
```bash
# DB-Status prüfen
docker-compose -f docker-compose.lightweight.yml logs db

# Notfalls DB neu starten
docker-compose -f docker-compose.lightweight.yml restart db
```

### Problem: Port 3003 bereits belegt

**Lösung:** Port in `docker-compose.lightweight.yml` ändern
```yaml
ports:
  - "3004:3000"  # Ändere 3003 zu 3004
```

Dann auch `NEXTAUTH_URL` anpassen:
```yaml
environment:
  NEXTAUTH_URL: http://localhost:3004
```

## 🔄 Updates

Nach Code-Änderungen:

```bash
# App neu starten (lädt Änderungen automatisch im Dev-Mode)
docker-compose -f docker-compose.lightweight.yml restart app

# Oder komplett neu starten
docker-compose -f docker-compose.lightweight.yml down
docker-compose -f docker-compose.lightweight.yml up -d
```

Nach Dependency-Änderungen (package.json):

```bash
# Dependencies neu installieren
npm install --legacy-peer-deps

# Container neu starten
docker-compose -f docker-compose.lightweight.yml restart app
```

Nach Schema-Änderungen (prisma/schema.prisma):

```bash
# Prisma neu generieren
npx prisma generate

# Datenbank synchronisieren
npx prisma db push

# Container neu starten
docker-compose -f docker-compose.lightweight.yml restart app
```

## ⚡ Performance-Tipps

1. **Hot Reload:** Im Dev-Mode werden Code-Änderungen automatisch übernommen
2. **Persistenz:** Datenbank-Daten bleiben in Docker Volume erhalten
3. **Schneller Start:** Kein Build = Start in ~10 Sekunden

## 🆚 Setup-Vergleich

| Feature | Lightweight | Standard | Simple |
|---------|-------------|----------|--------|
| RAM Bedarf | ~500MB | ~6GB | ~2GB |
| npm install | Host | Docker | Docker |
| Build | Nein | Ja | Nein |
| Mode | Dev | Production | Dev |
| Startup Zeit | ~10s | ~5min | ~2min |
| **Empfohlen für** | **Low-RAM** | High-RAM | Medium-RAM |

## 📚 Weitere Infos

- [Docker Setup](./DOCKER_SETUP.md) - Vollständige Docker-Dokumentation
- [README](./README.md) - Projekt-Übersicht
