"""
Seed script — peuple la table creatures depuis l'API Nookipedia (https://api.nookipedia.com)
Usage :  python scripts/seed_creatures.py

Doc API : https://api.nookipedia.com/doc
Clé API à définir dans la variable NOOKIPEDIA_API_KEY ci-dessous (ou via variable d'environnement).
"""
import sys
import os

# Remonter d'un niveau pour accéder à l'app Flask
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import requests
from app import create_app
from app.models import db, Creature

# ──────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────
NOOKIPEDIA_API_KEY = os.environ.get("NOOKIPEDIA_API_KEY", "193d5f1f-1336-405c-9b03-f2dc2fccefe7")
NOOKIPEDIA_BASE    = "https://api.nookipedia.com"
API_VERSION        = "1.5.0"   # Accept-Version recommandé par Nookipedia

# Mapping endpoint Nookipedia → catégorie interne
ENDPOINTS = {
    "nh/fish": Creature.CATEGORY_FISH,
    "nh/bugs": Creature.CATEGORY_BUG,
    "nh/sea":  Creature.CATEGORY_SEA,
}

# En-têtes communs à toutes les requêtes
HEADERS = {
    "X-API-KEY":      NOOKIPEDIA_API_KEY,
    "Accept-Version": API_VERSION,
}


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────
def parse_months(item: dict, hemisphere: str) -> list[int]:
    """
    Renvoie la liste des mois (1–12) disponibles pour l'hémisphère donné.
    L'API Nookipedia expose item["north"]["months_array"] / item["south"]["months_array"].
    """
    hemi_data = item.get(hemisphere, {})
    return hemi_data.get("months_array", [])


def parse_hours(item: dict) -> str:
    """
    Renvoie la plage horaire sous forme lisible.
    L'API expose le champ 'time' directement sur l'objet créature.
    """
    time_str = item.get("time", "")
    if not time_str or time_str.lower() == "all day":
        return "Toute la journée"
    return time_str


# ──────────────────────────────────────────────
# Seed principal
# ──────────────────────────────────────────────
def fetch_and_seed():
    app = create_app()
    with app.app_context():
        db.create_all()
        total_inserted = 0
        total_updated  = 0

        for endpoint, category in ENDPOINTS.items():
            print(f"\n📡 Récupération depuis /{endpoint}…")
            try:
                resp = requests.get(
                    f"{NOOKIPEDIA_BASE}/{endpoint}",
                    headers=HEADERS,
                    timeout=15,
                )
                resp.raise_for_status()
                creatures = resp.json()   # Liste d'objets (pas un dict indexé)
            except requests.HTTPError as e:
                print(f"  ❌ Erreur HTTP {resp.status_code} : {e}")
                continue
            except Exception as e:
                print(f"  ❌ Erreur : {e}")
                continue

            for item in creatures:
                # ── Champs communs ────────────────────────────
                name_en      = item.get("name", "")
                # Nookipedia est en anglais ; on utilise le même nom en fallback pour name_fr
                name_fr      = name_en

                months_north = parse_months(item, "north")
                months_south = parse_months(item, "south")
                hours        = parse_hours(item)
                location     = item.get("location", "")
                sell_price   = item.get("sell_nook", 0) or 0
                image_url    = item.get("image_url", "")
                # Nookipedia ne fournit pas d'icône séparée ; on réutilise image_url
                icon_url     = item.get("icon_url", image_url)

                if not name_en:
                    continue    # entrée invalide, on passe

                # ── Upsert ───────────────────────────────────
                existing = Creature.query.filter_by(
                    name_en=name_en, category=category
                ).first()

                if existing:
                    existing.name_fr         = name_fr
                    existing.months_north    = months_north
                    existing.months_south    = months_south
                    existing.hours_available = hours
                    existing.location        = location
                    existing.sell_price      = sell_price
                    existing.image_url       = image_url
                    existing.icon_url        = icon_url
                    total_updated += 1
                else:
                    creature = Creature(
                        name_fr=name_fr,
                        name_en=name_en,
                        category=category,
                        months_north=months_north,
                        months_south=months_south,
                        hours_available=hours,
                        location=location,
                        sell_price=sell_price,
                        image_url=image_url,
                        icon_url=icon_url,
                    )
                    db.session.add(creature)
                    total_inserted += 1

            db.session.commit()
            print(f"  ✅ {len(creatures)} créatures traitées pour '{category}'")

        print(f"\n🎉 Terminé ! {total_inserted} insérées, {total_updated} mises à jour.")


if __name__ == "__main__":
    fetch_and_seed()
