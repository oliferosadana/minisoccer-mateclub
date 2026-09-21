#!/usr/bin/env bash
set -e

echo "========================================================"
echo " ⚽ MATE CLUB Mini Soccer - Production Deployment Script"
echo "========================================================"

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "📍 Working Directory: $APP_DIR"

# 1. Pull latest code if git repo
if [ -d ".git" ]; then
  echo "📥 Menarik perubahan kode terbaru dari Git..."
  git pull origin main || true
fi

# 2. Build and restart Docker containers
echo "🐳 Menjalankan build kontainer Docker..."
docker compose down || true
docker compose up -d --build --remove-orphans

# 3. Health check verification
echo "⏳ Menunggu container online..."
sleep 3

if curl -s -f http://localhost:8080 > /dev/null; then
  echo "✅ Deployment Sukses! Aplikasi berjalan pada http://localhost:8080"
else
  echo "⚠️ Container berjalan, namun respon HTTP belum siap. Silakan periksa log: docker logs mateclub-minisoccer-web"
fi
