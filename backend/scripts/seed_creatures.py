"""
Seed script — peuple la table creatures depuis l'API ACNH (http://acnhapi.com/)
Usage :  python scripts/seed_creatures.py
"""
import sys
import os

# Remonter d'un niveau pour accéder à l'app Flask
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import requests
from app import create_app
from app.models import db, Creature

ACNH_BASE = "http://acnhapi.com/v1"

# Mapping endpoint → catégorie interne
ENDPOINTS = {
    "fish":         Creature.CATEGORY_FISH,
    "bugs":         Creature.CATEGORY_BUG,
    "sea":          Creature.CATEGORY_SEA,
}

MONTH_LABELS_FR = {
    1: "Janvier", 2: "Février", 3: "Mars", 4: "Avril",
    5: "Mai",     6: "Juin",   7: "Juillet", 8: "Août",
    9: "Septembre", 10: "Octobre", 11: "Novembre", 12: "Décembre",
}


def parse_months(availability: dict, hemisphere: str) -> list[int]:
    """Renvoie la liste des mois (1–12) disponibles pour un hémisphère."""
    key = "isAllYear" if hemisphere == "north" else "isAllYear"
    # The ACNH API uses month-array-northern / month-array-southern
    north_key = "month-array-northern"
    south_key = "month-array-southern"
    return availability.get(north_key if hemisphere == "north" else south_key, [])


def parse_hours(availability: dict) -> str:
    if availability.get("isAllDay"):
        return "Toute la journée"
    time_str = availability.get("time", "")
    return time_str or "Variable"


def fetch_and_seed():
    app = create_app()
    with app.app_context():
        db.create_all()
        total_inserted = 0
        total_updated = 0

        for endpoint, category in ENDPOINTS.items():
            print(f"\n📡 Récupération des {endpoint}...")
            try:
                resp = requests.get(f"{ACNH_BASE}/{endpoint}", timeout=15)
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                print(f"  ❌ Erreur : {e}")
                continue

            for key, item in data.items():
                name_fr = item.get("name", {}).get("name-EUfr") or item.get("name", {}).get("name-USen", key)
                name_en = item.get("name", {}).get("name-USen", key)
                availability = item.get("availability", {})

                months_north = parse_months(availability, "north")
                months_south = parse_months(availability, "south")
                hours = parse_hours(availability)
                location = availability.get("location", "")
                sell_price = item.get("price", 0)
                image_url = item.get("image_uri", "")
                icon_url = item.get("icon_uri", "")

                existing = Creature.query.filter_by(name_en=name_en, category=category).first()
                if existing:
                    # Update
                    existing.name_fr = name_fr
                    existing.months_north = months_north
                    existing.months_south = months_south
                    existing.hours_available = hours
                    existing.location = location
                    existing.sell_price = sell_price
                    existing.image_url = image_url
                    existing.icon_url = icon_url
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
            print(f"  ✅ {len(data)} créatures traitées pour '{category}'")

        print(f"\n🎉 Terminé ! {total_inserted} insérées, {total_updated} mises à jour.")


if __name__ == "__main__":
    fetch_and_seed()
