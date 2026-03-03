from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db, User, Island, TurnipPrice
from app.ai.turnip_predictor import TurnipPredictor

turnips_bp = Blueprint("turnips", __name__)


def _get_island(user_id, island_id=None):
    """Return the requested island (or first island) for the current user."""
    if island_id:
        return Island.query.filter_by(id=island_id, user_id=user_id).first_or_404()
    island = Island.query.filter_by(user_id=user_id).first()
    if not island:
        from flask import abort
        abort(404, description="Aucune île trouvée. Créez d'abord votre île.")
    return island


def _get_current_week_sunday() -> date:
    """Return the Sunday of the current week."""
    today = date.today()
    days_since_sunday = (today.weekday() + 1) % 7  # Monday=0 -> Sunday=0
    sunday = today - timedelta(days=days_since_sunday)
    return sunday


@turnips_bp.post("/prices")
@jwt_required()
def save_prices():
    """Save or update turnip prices for the current week."""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    island_id = data.get("island_id")
    island = _get_island(user_id, island_id)

    purchase_price = data.get("purchase_price")
    if not purchase_price or purchase_price < 90 or purchase_price > 110:
        return jsonify({"error": "Prix d'achat invalide (90-110 clochettes)"}), 400

    # Get or create record for current week
    week_start = _get_current_week_sunday()
    record = TurnipPrice.query.filter_by(
        island_id=island.id, week_start_date=week_start
    ).first()

    if record is None:
        record = TurnipPrice(
            island_id=island.id,
            week_start_date=week_start,
            purchase_price=purchase_price,
        )
        db.session.add(record)
    else:
        record.purchase_price = purchase_price

    # Update prices
    price_fields = [
        "monday_am", "monday_pm", "tuesday_am", "tuesday_pm",
        "wednesday_am", "wednesday_pm", "thursday_am", "thursday_pm",
        "friday_am", "friday_pm", "saturday_am", "saturday_pm",
    ]
    for field in price_fields:
        value = data.get(field, None)
        if value is not None and (value < 0 or value > 660):
            return jsonify({"error": f"{field}: prix invalide (0-660)"}), 400
        setattr(record, field, value)

    db.session.commit()
    return jsonify(record.to_dict()), 201


@turnips_bp.get("/prices/current")
@jwt_required()
def get_current_prices():
    """Get prices for the current week."""
    user_id = int(get_jwt_identity())
    island_id = request.args.get("island_id", type=int)
    island = _get_island(user_id, island_id)

    week_start = _get_current_week_sunday()
    record = TurnipPrice.query.filter_by(
        island_id=island.id, week_start_date=week_start
    ).first()

    if not record:
        return jsonify({"message": "Aucun prix cette semaine"}), 404

    return jsonify(record.to_dict()), 200


@turnips_bp.get("/predict")
@jwt_required()
def predict():
    """Run AI prediction on current week's prices."""
    user_id = int(get_jwt_identity())
    island_id = request.args.get("island_id", type=int)
    island = _get_island(user_id, island_id)

    week_start = _get_current_week_sunday()
    record = TurnipPrice.query.filter_by(
        island_id=island.id, week_start_date=week_start
    ).first()

    if not record:
        return jsonify({"error": "Aucun prix saisi pour cette semaine"}), 404

    # Run prediction
    prices = record.get_prices_array()
    predictor = TurnipPredictor(purchase_price=record.purchase_price, prices=prices)
    prediction = predictor.predict()

    # Save detected pattern
    if prediction["confidence"] > 0.6:
        record.pattern_type = prediction["pattern"]
        db.session.commit()

    return jsonify({
        "purchase_price": record.purchase_price,
        "week_start_date": record.week_start_date.isoformat(),
        "current_prices": record.to_dict()["prices"],
        "prediction": prediction,
    }), 200


@turnips_bp.get("/history")
@jwt_required()
def get_history():
    """Get historical turnip data for the island."""
    user_id = int(get_jwt_identity())
    island_id = request.args.get("island_id", type=int)
    limit = request.args.get("limit", 10, type=int)
    island = _get_island(user_id, island_id)

    records = (
        TurnipPrice.query.filter_by(island_id=island.id)
        .order_by(TurnipPrice.week_start_date.desc())
        .limit(limit)
        .all()
    )

    return jsonify([r.to_dict() for r in records]), 200


@turnips_bp.delete("/prices/current")
@jwt_required()
def delete_current_week():
    """Delete current week's data."""
    user_id = int(get_jwt_identity())
    island_id = request.args.get("island_id", type=int)
    island = _get_island(user_id, island_id)

    week_start = _get_current_week_sunday()
    record = TurnipPrice.query.filter_by(
        island_id=island.id, week_start_date=week_start
    ).first()

    if not record:
        return jsonify({"error": "Aucune donnée à supprimer"}), 404

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Données supprimées"}), 200
