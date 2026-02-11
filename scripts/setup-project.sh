#!/bin/bash

echo "🏝️ Setting up Animal Crossing Tracker..."

# Backend setup
echo "📦 Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask db upgrade
python scripts/populate_creatures.py
cd ..

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
echo "To start development:"
echo "  Backend: cd backend && source venv/bin/activate && flask run"
echo "  Frontend: cd frontend && npm run dev"
