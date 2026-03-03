#!/bin/bash

# ============================================================
#  🌿 Animal Crossing Tracker — Script de lancement
# ============================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BACKEND_DIR="$(cd "$(dirname "$0")/backend" && pwd)"
FRONTEND_DIR="$(cd "$(dirname "$0")/frontend" && pwd)"

echo -e "${GREEN}"
echo "  🏝️  Animal Crossing Tracker"
echo "==============================${NC}"

# ── 1. Vérification PostgreSQL ──────────────────────────────
echo -e "\n${YELLOW}[1/5] Vérification de PostgreSQL...${NC}"
if ! pg_isready -q; then
  echo -e "${RED}❌ PostgreSQL ne tourne pas. Lance-le avec :${NC}"
  echo "     sudo service postgresql start"
  echo "  ou sudo systemctl start postgresql"
  exit 1
fi
echo -e "${GREEN}✅ PostgreSQL OK${NC}"

# ── 2. Fichier .env ─────────────────────────────────────────
echo -e "\n${YELLOW}[2/5] Vérification du fichier .env...${NC}"
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo -e "${YELLOW}⚠️  Pas de .env trouvé → copie depuis .env.example${NC}"
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  echo -e "${RED}⚠️  IMPORTANT : édite backend/.env et renseigne tes vrais secrets !${NC}"
  echo "     nano $BACKEND_DIR/.env"
fi
echo -e "${GREEN}✅ .env présent${NC}"

# ── 3. Dépendances Python ────────────────────────────────────
echo -e "\n${YELLOW}[3/5] Installation des dépendances Python...${NC}"
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
  echo "  → Création de l'environnement virtuel..."
  python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt
echo -e "${GREEN}✅ Dépendances Python OK${NC}"

# ── 4. Base de données & Migrations ─────────────────────────
echo -e "\n${YELLOW}[4/5] Migrations base de données...${NC}"

# Crée la DB si elle n'existe pas
DB_NAME=$(grep DATABASE_URL "$BACKEND_DIR/.env" | sed 's/.*\///' | sed 's/".*//')
if [ -n "$DB_NAME" ]; then
  psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null && \
    echo "  → Base '$DB_NAME' créée"
fi

# Init migrations si pas encore fait
if [ ! -d "$BACKEND_DIR/migrations" ]; then
  echo "  → Initialisation des migrations (première fois)..."
  flask db init
  flask db migrate -m "init"
fi

flask db upgrade
echo -e "${GREEN}✅ Base de données OK${NC}"

# ── 5. Seed des créatures (première fois) ───────────────────
if [ -f "$BACKEND_DIR/scripts/seed_creatures.py" ]; then
  SEED_FLAG="$BACKEND_DIR/.seeded"
  if [ ! -f "$SEED_FLAG" ]; then
    echo -e "\n${YELLOW}[5/5] Peuplement des créatures (première fois)...${NC}"
    python "$BACKEND_DIR/scripts/seed_creatures.py" && touch "$SEED_FLAG"
    echo -e "${GREEN}✅ Créatures seedées${NC}"
  else
    echo -e "\n${GREEN}[5/5] Créatures déjà seedées ✅${NC}"
  fi
fi

# ── Dépendances Frontend ─────────────────────────────────────
echo -e "\n${YELLOW}[+] Vérification des dépendances frontend...${NC}"
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
  echo "  → Installation npm (première fois)..."
  npm install
fi
echo -e "${GREEN}✅ Frontend prêt${NC}"

# ── Lancement des serveurs ───────────────────────────────────
echo -e "\n${GREEN}🚀 Lancement des serveurs...${NC}"
echo -e "   Backend  → http://localhost:5000"
echo -e "   Frontend → http://localhost:5173"
echo -e "\n${YELLOW}Ctrl+C pour tout arrêter${NC}\n"

# Lance le backend en arrière-plan
cd "$BACKEND_DIR"
source venv/bin/activate
FLASK_APP=run.py FLASK_ENV=development flask run --port 5000 &
BACKEND_PID=$!

# Lance le frontend en avant-plan
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

# Gestion propre de l'arrêt
trap "echo -e '\n${YELLOW}Arrêt des serveurs...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID
