from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db, User, Island, Creature, CreopediaProgress

creatures_bp = Blueprint("creatures", __name__)


def _get_island(user_id, island_id=None):
    """Return the requested island (or first island) for the current user."""
    if island_id:
        return Island.query.filter_by(id=island_id, user_id=user_id).first_or_404()
    island = Island.query.filter_by(user_id=user_id).first()
    if not island:
        from flask import abort
        abort(404, description="Aucune île trouvée. Créez d'abord votre île.")
    return island


@creatures_bp.get("/creatures")
@jwt_required()
def get_creatures():
    user_id = int(get_jwt_identity())
    island_id = request.args.get("island_id", type=int)
    island = _get_island(user_id, island_id)

    # Filters
    category = request.args.get("category")
    month = request.args.get("month", type=int)
    collected_filter = request.args.get("collected")
    search = (request.args.get("search") or "").strip().lower()

    query = Creature.query
    if category and category in Creature.VALID_CATEGORIES:
        query = query.filter_by(category=category)
    all_creatures = query.order_by(Creature.category, Creature.name_fr).all()

    # Build collected set for this island
    progress_rows = CreopediaProgress.query.filter_by(island_id=island.id).all()
    collected_ids = {p.creature_id for p in progress_rows if p.collected}

    result = []
    for c in all_creatures:
        col = c.id in collected_ids
        months = c.months_north if island.hemisphere == "north" else c.months_south

        # Month filter
        if month and month not in (months or []):
            continue
        # Collected filter
        if collected_filter == "true" and not col:
            continue
        if collected_filter == "false" and col:
            continue
        # Search
        if search and search not in c.name_fr.lower() and search not in c.name_en.lower():
            continue

        result.append(c.to_dict(hemisphere=island.hemisphere, collected=col))

    # Stats per category
    total_by_cat = {}
    collected_by_cat = {}
    for c in all_creatures:
        cat = c.category
        total_by_cat[cat] = total_by_cat.get(cat, 0) + 1
        if c.id in collected_ids:
            collected_by_cat[cat] = collected_by_cat.get(cat, 0) + 1

    total = len(all_creatures)
    collected_total = len(collected_ids)
    stats = {
        "total": total,
        "collected": collected_total,
        "percentage": round(collected_total / total * 100, 1) if total else 0,
        "by_category": {
            cat: {
                "total": total_by_cat.get(cat, 0),
                "collected": collected_by_cat.get(cat, 0),
                "percentage": round(
                    collected_by_cat.get(cat, 0) / total_by_cat.get(cat, 1) * 100, 1
                ),
            }
            for cat in Creature.VALID_CATEGORIES
        },
    }

    return jsonify({"creatures": result, "stats": stats}), 200


@creatures_bp.post("/creopedia/toggle")
@jwt_required()
def toggle_creature():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    creature_id = data.get("creature_id")
    collected = bool(data.get("collected", True))
    island_id = data.get("island_id")

    if not creature_id:
        return jsonify({"error": "creature_id requis"}), 400

    island = _get_island(user_id, island_id)
    creature = db.get_or_404(Creature, creature_id)

    progress = CreopediaProgress.query.filter_by(
        island_id=island.id, creature_id=creature.id
    ).first()

    if progress is None:
        progress = CreopediaProgress(island_id=island.id, creature_id=creature.id)
        db.session.add(progress)

    progress.collected = collected
    progress.collected_date = datetime.utcnow() if collected else None
    db.session.commit()

    return jsonify({
        "success": True,
        "creature_id": creature.id,
        "collected": progress.collected,
        "collected_date": progress.collected_date.isoformat() if progress.collected_date else None,
    }), 200


@creatures_bp.get("/creopedia/stats")
@jwt_required()
def creopedia_stats():
    user_id = int(get_jwt_identity())
    island_id = request.args.get("island_id", type=int)
    island = _get_island(user_id, island_id)

    total = Creature.query.count()
    collected = CreopediaProgress.query.filter_by(
        island_id=island.id, collected=True
    ).count()

    by_category = {}
    for cat in Creature.VALID_CATEGORIES:
        cat_total = Creature.query.filter_by(category=cat).count()
        cat_collected = (
            db.session.query(CreopediaProgress)
            .join(Creature, CreopediaProgress.creature_id == Creature.id)
            .filter(
                CreopediaProgress.island_id == island.id,
                CreopediaProgress.collected == True,
                Creature.category == cat,
            )
            .count()
        )
        by_category[cat] = {
            "total": cat_total,
            "collected": cat_collected,
            "percentage": round(cat_collected / cat_total * 100, 1) if cat_total else 0,
        }

    return jsonify({
        "total": total,
        "collected": collected,
        "percentage": round(collected / total * 100, 1) if total else 0,
        "by_category": by_category,
    }), 200
