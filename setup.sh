#!/bin/bash

echo "🚀 GBU Management - Lightweight Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert!"
    echo "   Installieren Sie Node.js 18+: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js gefunden: $(node --version)"
echo ""

# Install dependencies locally
echo "📦 Installiere Dependencies lokal (außerhalb Docker)..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ npm install fehlgeschlagen!"
    exit 1
fi

echo ""
echo "✅ Dependencies installiert!"
echo ""

# Generate Prisma Client
echo "🔧 Generiere Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma Generate fehlgeschlagen!"
    exit 1
fi

echo ""
echo "✅ Prisma Client generiert!"
echo ""

# Make executable
chmod +x setup.sh 2>/dev/null || true

echo "✅ Setup abgeschlossen!"
echo ""
echo "🚀 Starten Sie nun die Anwendung mit:"
echo "   docker-compose -f docker-compose.lightweight.yml up -d"
echo ""
echo "📍 Die App wird dann erreichbar sein unter:"
echo "   http://localhost:3003"
echo ""
