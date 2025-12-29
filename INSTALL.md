# GBU Management System - Installationsanleitung

## Systemanforderungen

- **Server**: Linux (Ubuntu 20.04+ empfohlen) oder Windows Server
- **Python**: 3.11 oder höher
- **Node.js**: 18.x oder höher
- **MariaDB**: 10.5 oder höher
- **Speicher**: Mindestens 4GB RAM
- **Festplatte**: Mindestens 10GB freier Speicher

## 1. Vorbereitung

### MariaDB installieren

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mariadb-server mariadb-client
sudo mysql_secure_installation
```

#### Windows:
Laden Sie MariaDB von https://mariadb.org/download/ herunter und installieren Sie es.

### Python und Node.js installieren

#### Ubuntu/Debian:
```bash
sudo apt install python3.11 python3.11-venv python3-pip
sudo apt install nodejs npm
```

#### Windows:
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/

## 2. Datenbank einrichten

### Datenbank und Benutzer erstellen

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE gbu_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gbu_user'@'localhost' IDENTIFIED BY 'IhrSicheresPasswort';
GRANT ALL PRIVILEGES ON gbu_management.* TO 'gbu_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Schema importieren

```bash
mysql -u gbu_user -p gbu_management < database/schema.sql
```

## 3. Backend einrichten

### Verzeichnis wechseln und virtuelle Umgebung erstellen

```bash
cd backend
python3 -m venv venv
```

### Virtuelle Umgebung aktivieren

#### Linux/Mac:
```bash
source venv/bin/activate
```

#### Windows:
```cmd
venv\Scripts\activate
```

### Abhängigkeiten installieren

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
nano .env  # oder verwenden Sie Ihren bevorzugten Editor
```

Passen Sie die Werte in `.env` an:

```env
DATABASE_URL=mysql+pymysql://gbu_user:IhrSicheresPasswort@localhost/gbu_management
SECRET_KEY=GenerierenSieEinenZufälligenSchlüssel
JWT_SECRET_KEY=GenerierenSieEinenWeiteren ZufälligenSchlüssel
FLASK_ENV=production
FLASK_DEBUG=False
```

**Wichtig**: Generieren Sie sichere Schlüssel mit:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Datenbank-Migrationen durchführen (falls erforderlich)

```bash
flask db upgrade
```

### Admin-Passwort ändern

Nach der Erstinstallation müssen Sie das Standard-Admin-Passwort ändern:

```bash
python << EOF
from app import create_app
from models import db, User
app = create_app()
with app.app_context():
    admin = User.query.filter_by(username='admin').first()
    if admin:
        admin.set_password('NeuesSicheresPasswort')
        db.session.commit()
        print("Admin-Passwort geändert")
EOF
```

## 4. Frontend einrichten

### Verzeichnis wechseln und Abhängigkeiten installieren

```bash
cd ../frontend
npm install
```

### Umgebungsvariablen konfigurieren

Erstellen Sie `.env.production`:

```bash
REACT_APP_API_URL=http://your-server-ip:5000/api
```

Für die Entwicklung erstellen Sie `.env.development`:

```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### Frontend bauen

```bash
npm run build
```

## 5. Produktions-Deployment

### Backend mit Gunicorn

#### Gunicorn-Konfiguration erstellen

`backend/gunicorn_config.py`:

```python
bind = "0.0.0.0:5000"
workers = 4
worker_class = "sync"
timeout = 120
accesslog = "logs/access.log"
errorlog = "logs/error.log"
loglevel = "info"
```

#### Log-Verzeichnis erstellen

```bash
cd backend
mkdir logs
```

#### Gunicorn starten

```bash
gunicorn -c gunicorn_config.py app:app
```

### Systemd Service einrichten (Linux)

`/etc/systemd/system/gbu-backend.service`:

```ini
[Unit]
Description=GBU Management Backend
After=network.target mariadb.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/pfad/zu/GBU_Management/backend
Environment="PATH=/pfad/zu/GBU_Management/backend/venv/bin"
ExecStart=/pfad/zu/GBU_Management/backend/venv/bin/gunicorn -c gunicorn_config.py app:app

[Install]
WantedBy=multi-user.target
```

Service aktivieren und starten:

```bash
sudo systemctl daemon-reload
sudo systemctl enable gbu-backend
sudo systemctl start gbu-backend
sudo systemctl status gbu-backend
```

### Nginx als Reverse Proxy einrichten

#### Nginx installieren

```bash
sudo apt install nginx
```

#### Nginx-Konfiguration

`/etc/nginx/sites-available/gbu-management`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /pfad/zu/GBU_Management/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Erhöhen Sie die maximale Upload-Größe für CSV-Dateien
    client_max_body_size 20M;
}
```

Site aktivieren:

```bash
sudo ln -s /etc/nginx/sites-available/gbu-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL mit Let's Encrypt einrichten (optional, aber empfohlen)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 6. Entwicklungs-Setup

### Backend starten (Entwicklung)

```bash
cd backend
source venv/bin/activate  # Linux/Mac
# oder
venv\Scripts\activate  # Windows

python app.py
```

Backend läuft auf: http://localhost:5000

### Frontend starten (Entwicklung)

```bash
cd frontend
npm start
```

Frontend läuft auf: http://localhost:3000

## 7. Standard-Zugangsdaten

**Benutzername**: admin
**Passwort**: admin123

**WICHTIG**: Ändern Sie das Passwort sofort nach der ersten Anmeldung!

## 8. Erste Schritte

1. Melden Sie sich mit den Standard-Zugangsdaten an
2. Ändern Sie das Admin-Passwort
3. Erstellen Sie Benutzer für Ihr Team (Bereichsleiter, Technische Leiter, Projektleiter)
4. Erstellen Sie Ihr erstes Projekt
5. Fügen Sie GBU-Vorlagen hinzu oder erstellen Sie neue Gefährdungsbeurteilungen

## 9. Backup und Wartung

### Datenbank-Backup

```bash
mysqldump -u gbu_user -p gbu_management > backup_$(date +%Y%m%d).sql
```

### Automatisches Backup einrichten (Cron)

```bash
crontab -e
```

Fügen Sie hinzu:
```
0 2 * * * mysqldump -u gbu_user -pIhrPasswort gbu_management > /pfad/zu/backups/gbu_backup_$(date +\%Y\%m\%d).sql
```

## 10. Troubleshooting

### Backend startet nicht

- Überprüfen Sie die Logs: `tail -f backend/logs/error.log`
- Überprüfen Sie die Datenbankverbindung in `.env`
- Stellen Sie sicher, dass alle Abhängigkeiten installiert sind

### Frontend kann Backend nicht erreichen

- Überprüfen Sie `REACT_APP_API_URL` in den Frontend-Umgebungsvariablen
- Überprüfen Sie CORS-Einstellungen im Backend
- Überprüfen Sie Firewall-Regeln

### Datenbank-Verbindungsfehler

- Überprüfen Sie, ob MariaDB läuft: `sudo systemctl status mariadb`
- Überprüfen Sie Benutzername und Passwort
- Überprüfen Sie, ob der Datenbankbenutzer die richtigen Berechtigungen hat

## Support

Bei Problemen oder Fragen erstellen Sie bitte ein Issue im GitHub-Repository.
