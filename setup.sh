#!/bin/bash

# GBU Management System - Setup Script
# Dieses Skript hilft bei der automatischen Einrichtung des Systems

set -e

echo "======================================"
echo "GBU Management System Setup"
echo "======================================"
echo ""

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktion für Erfolgsmeldungen
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Funktion für Fehlermeldungen
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Funktion für Warnungen
warning() {
    echo -e "${YELLOW}! $1${NC}"
}

# Prüfe ob Root-Rechte vorhanden sind
if [ "$EUID" -eq 0 ]; then
    warning "Dieses Skript sollte nicht als Root ausgeführt werden."
    warning "Verwenden Sie 'sudo' nur wenn nötig."
fi

# Schritt 1: Systemvoraussetzungen prüfen
echo "Schritt 1: Systemvoraussetzungen prüfen..."
echo ""

# Python prüfen
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    success "Python $PYTHON_VERSION gefunden"
else
    error "Python 3 nicht gefunden. Bitte installieren Sie Python 3.11 oder höher."
    exit 1
fi

# Node.js prüfen
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js $NODE_VERSION gefunden"
else
    error "Node.js nicht gefunden. Bitte installieren Sie Node.js 18 oder höher."
    exit 1
fi

# MariaDB prüfen
if command -v mysql &> /dev/null; then
    success "MariaDB/MySQL gefunden"
else
    error "MariaDB/MySQL nicht gefunden. Bitte installieren Sie MariaDB."
    exit 1
fi

echo ""

# Schritt 2: Backend einrichten
echo "Schritt 2: Backend einrichten..."
echo ""

cd backend

# Virtuelle Umgebung erstellen
if [ ! -d "venv" ]; then
    echo "Erstelle virtuelle Umgebung..."
    python3 -m venv venv
    success "Virtuelle Umgebung erstellt"
else
    warning "Virtuelle Umgebung existiert bereits"
fi

# Virtuelle Umgebung aktivieren
source venv/bin/activate

# Abhängigkeiten installieren
echo "Installiere Python-Abhängigkeiten..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
success "Python-Abhängigkeiten installiert"

# .env erstellen falls nicht vorhanden
if [ ! -f ".env" ]; then
    echo "Erstelle .env Datei..."
    cp .env.example .env

    # Generiere zufällige Schlüssel
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

    # Ersetze Platzhalter
    sed -i "s/your-secret-key-change-this-in-production/$SECRET_KEY/" .env
    sed -i "s/your-jwt-secret-key-change-this-in-production/$JWT_SECRET_KEY/" .env

    success ".env Datei erstellt mit generierten Schlüsseln"
    warning "Bitte passen Sie die Datenbankverbindung in .env an!"
else
    warning ".env Datei existiert bereits"
fi

# Log- und Upload-Verzeichnisse erstellen
mkdir -p logs uploads pdfs
success "Verzeichnisse erstellt"

cd ..

echo ""

# Schritt 3: Frontend einrichten
echo "Schritt 3: Frontend einrichten..."
echo ""

cd frontend

# Node-Abhängigkeiten installieren
echo "Installiere Node.js-Abhängigkeiten (dies kann einige Minuten dauern)..."
npm install > /dev/null 2>&1
success "Node.js-Abhängigkeiten installiert"

# .env.development erstellen
if [ ! -f ".env.development" ]; then
    echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.development
    success ".env.development erstellt"
else
    warning ".env.development existiert bereits"
fi

cd ..

echo ""

# Schritt 4: Datenbank einrichten
echo "Schritt 4: Datenbank einrichten..."
echo ""

read -p "Möchten Sie die Datenbank jetzt einrichten? (j/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[JjYy]$ ]]; then
    read -p "MariaDB Root-Passwort: " -s MYSQL_ROOT_PASSWORD
    echo ""
    read -p "Neues Datenbank-Passwort für 'gbu_user': " -s DB_PASSWORD
    echo ""

    # Datenbank erstellen
    mysql -u root -p$MYSQL_ROOT_PASSWORD << EOF
CREATE DATABASE IF NOT EXISTS gbu_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'gbu_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON gbu_management.* TO 'gbu_user'@'localhost';
FLUSH PRIVILEGES;
EOF

    if [ $? -eq 0 ]; then
        success "Datenbank und Benutzer erstellt"

        # Schema importieren
        mysql -u root -p$MYSQL_ROOT_PASSWORD gbu_management < database/schema.sql
        success "Datenbankschema importiert"

        # .env aktualisieren
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=mysql+pymysql://gbu_user:$DB_PASSWORD@localhost/gbu_management|" backend/.env
        success "Datenbankverbindung in .env aktualisiert"
    else
        error "Fehler beim Erstellen der Datenbank"
    fi
else
    warning "Datenbankeinrichtung übersprungen"
    warning "Bitte führen Sie die Schritte in INSTALL.md manuell aus"
fi

echo ""

# Zusammenfassung
echo "======================================"
echo "Setup abgeschlossen!"
echo "======================================"
echo ""
echo "Nächste Schritte:"
echo ""
echo "1. Backend starten (Entwicklung):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "2. Frontend starten (in neuem Terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Im Browser öffnen:"
echo "   http://localhost:3000"
echo ""
echo "4. Standard-Zugangsdaten:"
echo "   Benutzername: admin"
echo "   Passwort: admin123"
echo ""
warning "WICHTIG: Ändern Sie das Admin-Passwort nach der ersten Anmeldung!"
echo ""
echo "Weitere Informationen finden Sie in INSTALL.md und README.md"
echo ""
