#!/bin/bash

# Script de création de l'arborescence du projet ACNH
# Ce script crée tous les dossiers et fichiers vides nécessaires

echo "🏝️  Création de la structure du projet ACNH..."

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour créer un fichier vide avec un message
create_file() {
    touch "$1"
    echo -e "${GREEN}✓${NC} Créé: $1"
}

# Fonction pour créer un dossier
create_dir() {
    mkdir -p "$1"
    echo -e "${BLUE}📁${NC} Dossier: $1"
}

# ============================================================================
# STRUCTURE RACINE
# ============================================================================

create_file ".gitignore"
create_file "README.md"
create_file "LICENSE"

# ============================================================================
# FRONTEND
# ============================================================================

echo -e "\n${BLUE}=== FRONTEND ===${NC}"

# Public
create_dir "frontend/public/images"
create_file "frontend/public/favicon.ico"
create_file "frontend/public/logo-acnh.png"
create_file "frontend/public/images/placeholder-creature.png"

# Assets
create_dir "frontend/src/assets/images/patterns"
create_dir "frontend/src/assets/styles"
create_file "frontend/src/assets/images/logo.svg"
create_file "frontend/src/assets/images/hero-bg.jpg"
create_file "frontend/src/assets/images/patterns/decreasing.svg"
create_file "frontend/src/assets/images/patterns/small-spike.svg"
create_file "frontend/src/assets/images/patterns/large-spike.svg"
create_file "frontend/src/assets/images/patterns/random.svg"
create_file "frontend/src/assets/styles/global.css"

# Components - Auth
create_dir "frontend/src/components/auth"
create_file "frontend/src/components/auth/LoginForm.jsx"
create_file "frontend/src/components/auth/SignupForm.jsx"
create_file "frontend/src/components/auth/IslandSetup.jsx"
create_file "frontend/src/components/auth/ProtectedRoute.jsx"

# Components - Creopedia
create_dir "frontend/src/components/creopedia"
create_file "frontend/src/components/creopedia/CreopediaList.jsx"
create_file "frontend/src/components/creopedia/CreatureCard.jsx"
create_file "frontend/src/components/creopedia/FilterBar.jsx"
create_file "frontend/src/components/creopedia/SearchBar.jsx"
create_file "frontend/src/components/creopedia/ProgressStats.jsx"
create_file "frontend/src/components/creopedia/CreatureModal.jsx"

# Components - Turnips
create_dir "frontend/src/components/turnips"
create_file "frontend/src/components/turnips/TurnipPriceForm.jsx"
create_file "frontend/src/components/turnips/TurnipChart.jsx"
create_file "frontend/src/components/turnips/PatternDetector.jsx"
create_file "frontend/src/components/turnips/PredictionPanel.jsx"
create_file "frontend/src/components/turnips/WeeklyHistory.jsx"

# Components - Common
create_dir "frontend/src/components/common"
create_file "frontend/src/components/common/Navbar.jsx"
create_file "frontend/src/components/common/Sidebar.jsx"
create_file "frontend/src/components/common/Footer.jsx"
create_file "frontend/src/components/common/LoadingSpinner.jsx"
create_file "frontend/src/components/common/ErrorBoundary.jsx"
create_file "frontend/src/components/common/Toast.jsx"
create_file "frontend/src/components/common/Button.jsx"

# Contexts
create_dir "frontend/src/contexts"
create_file "frontend/src/contexts/AuthContext.jsx"
create_file "frontend/src/contexts/ThemeContext.jsx"

# Hooks
create_dir "frontend/src/hooks"
create_file "frontend/src/hooks/useAuth.js"
create_file "frontend/src/hooks/useToast.js"
create_file "frontend/src/hooks/useDebounce.js"

# Services
create_dir "frontend/src/services"
create_file "frontend/src/services/api.js"
create_file "frontend/src/services/authService.js"
create_file "frontend/src/services/creopediaService.js"
create_file "frontend/src/services/turnipsService.js"

# Utils
create_dir "frontend/src/utils"
create_file "frontend/src/utils/constants.js"
create_file "frontend/src/utils/validators.js"
create_file "frontend/src/utils/helpers.js"

# Pages
create_dir "frontend/src/pages"
create_file "frontend/src/pages/LandingPage.jsx"
create_file "frontend/src/pages/LoginPage.jsx"
create_file "frontend/src/pages/SignupPage.jsx"
create_file "frontend/src/pages/DashboardPage.jsx"
create_file "frontend/src/pages/CreopediaPage.jsx"
create_file "frontend/src/pages/TurnipsPage.jsx"
create_file "frontend/src/pages/NotFoundPage.jsx"

# Root files
create_file "frontend/src/App.jsx"
create_file "frontend/src/main.jsx"
create_file "frontend/src/index.css"

# Config files
create_file "frontend/.env.development"
create_file "frontend/.env.production"
create_file "frontend/.eslintrc.cjs"
create_file "frontend/.gitignore"
create_file "frontend/index.html"
create_file "frontend/package.json"
create_file "frontend/package-lock.json"
create_file "frontend/postcss.config.js"
create_file "frontend/tailwind.config.js"
create_file "frontend/vite.config.js"
create_file "frontend/README.md"

# ============================================================================
# BACKEND
# ============================================================================

echo -e "\n${BLUE}=== BACKEND ===${NC}"

# App - Models
create_dir "backend/app/models"
create_file "backend/app/__init__.py"
create_file "backend/app/models/__init__.py"
create_file "backend/app/models/user.py"
create_file "backend/app/models/island.py"
create_file "backend/app/models/creopedia_progress.py"
create_file "backend/app/models/turnip_price.py"
create_file "backend/app/models/creature.py"

# App - Routes
create_dir "backend/app/routes"
create_file "backend/app/routes/__init__.py"
create_file "backend/app/routes/auth.py"
create_file "backend/app/routes/islands.py"
create_file "backend/app/routes/creopedia.py"
create_file "backend/app/routes/turnips.py"

# App - Utils
create_dir "backend/app/utils"
create_file "backend/app/utils/__init__.py"
create_file "backend/app/utils/jwt_helper.py"
create_file "backend/app/utils/validation.py"
create_file "backend/app/utils/decorators.py"

# App - AI
create_dir "backend/app/ai"
create_file "backend/app/ai/__init__.py"
create_file "backend/app/ai/turnip_predictor.py"

# App - Config
create_file "backend/app/config.py"

# Migrations
create_dir "backend/migrations/versions"
create_file "backend/migrations/alembic.ini"
create_file "backend/migrations/env.py"
create_file "backend/migrations/README"

# Tests
create_dir "backend/tests"
create_file "backend/tests/__init__.py"
create_file "backend/tests/conftest.py"
create_file "backend/tests/test_auth.py"
create_file "backend/tests/test_islands.py"
create_file "backend/tests/test_creopedia.py"
create_file "backend/tests/test_turnips.py"
create_file "backend/tests/test_ai_predictor.py"

# Scripts
create_dir "backend/scripts"
create_file "backend/scripts/populate_creatures.py"
create_file "backend/scripts/create_admin.py"
create_file "backend/scripts/reset_database.py"

# Config files
create_file "backend/.env.development"
create_file "backend/.env.production"
create_file "backend/.flaskenv"
create_file "backend/.gitignore"
create_file "backend/requirements.txt"
create_file "backend/run.py"
create_file "backend/Procfile"
create_file "backend/runtime.txt"
create_file "backend/README.md"

# ============================================================================
# DOCS
# ============================================================================

echo -e "\n${BLUE}=== DOCS ===${NC}"

create_dir "docs/api-documentation"
create_dir "docs/diagrams"
create_dir "docs/mockups/exports"
create_dir "docs/presentation"

create_file "docs/stage1-concept.pdf"
create_file "docs/stage2-planning.pdf"
create_file "docs/stage3-technical-documentation.pdf"
create_file "docs/user-guide.pdf"

create_file "docs/api-documentation/postman-collection.json"
create_file "docs/api-documentation/swagger.yaml"

create_file "docs/diagrams/architecture-3-tiers.png"
create_file "docs/diagrams/erd-database.png"
create_file "docs/diagrams/sequence-auth.png"
create_file "docs/diagrams/sequence-creopedia.png"
create_file "docs/diagrams/sequence-turnips-prediction.png"

create_file "docs/mockups/figma-link.txt"
create_file "docs/mockups/exports/landing-page.png"
create_file "docs/mockups/exports/login-signup.png"
create_file "docs/mockups/exports/dashboard.png"
create_file "docs/mockups/exports/creopedia.png"
create_file "docs/mockups/exports/turnips.png"

create_file "docs/presentation/soutenance-finale.pptx"
create_file "docs/presentation/demo-video.mp4"

# ============================================================================
# SCRIPTS
# ============================================================================

echo -e "\n${BLUE}=== SCRIPTS ===${NC}"

create_dir "scripts"
create_file "scripts/setup-project.sh"
create_file "scripts/run-dev.sh"
create_file "scripts/run-tests.sh"
create_file "scripts/deploy.sh"

# Rendre les scripts exécutables
chmod +x scripts/*.sh

# ============================================================================
# RÉSUMÉ
# ============================================================================

echo -e "\n${GREEN}✅ Structure du projet ACNH créée avec succès!${NC}"
echo -e "\n📊 Résumé:"
echo "   - Frontend: React + Vite + Tailwind CSS"
echo "   - Backend: Flask + SQLAlchemy + IA"
echo "   - Documentation complète"
echo "   - Scripts de développement"
echo -e "\n🚀 Prochaines étapes:"
echo "   1. cd Animal-Crossing-Tracker/frontend && npm install"
echo "   2. cd Animal-Crossing-Tracker/backend && pip install -r requirements.txt"
echo "   3. Configurer les fichiers .env"
echo "   4. Lancer le développement avec scripts/run-dev.sh"
echo ""
