from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db, User, Island

islands_bp = Blueprint("islands", __name__)


def _current_user():
    return db.get_or_404(User, int(get_jwt_identity()))


@islands_bp.post("")
@jwt_required()
def create_island():
    user = _current_user()
    data = request.get_json()

    name = (data.get("name") or "").strip()
    hemisphere = (data.get("hemisphere") or "north").lower()

    if not name:
        return jsonify({"error": "Le nom de l'île est requis"}), 400

    if hemisphere not in Island.VALID_HEMISPHERES:
        return jsonify({"error": "L'hémisphère doit être 'north' ou 'south'"}), 400

    island = Island(user_id=user.id, name=name, hemisphere=hemisphere)
    db.session.add(island)
    db.session.commit()

    return jsonify(island.to_dict()), 201


@islands_bp.get("")
@jwt_required()
def get_islands():
    user = _current_user()
    return jsonify([i.to_dict() for i in user.islands]), 200


@islands_bp.get("/<int:island_id>")
@jwt_required()
def get_island(island_id):
    user = _current_user()
    island = Island.query.filter_by(id=island_id, user_id=user.id).first_or_404()
    return jsonify(island.to_dict()), 200


@islands_bp.put("/<int:island_id>")
@jwt_required()
def update_island(island_id):
    user = _current_user()
    island = Island.query.filter_by(id=island_id, user_id=user.id).first_or_404()
    data = request.get_json()

    if "name" in data:
        name = data["name"].strip()
        if not name:
            return jsonify({"error": "Le nom ne peut pas être vide"}), 400
        island.name = name

    if "hemisphere" in data:
        hemisphere = data["hemisphere"].lower()
        if hemisphere not in Island.VALID_HEMISPHERES:
            return jsonify({"error": "Hémisphère invalide"}), 400
        island.hemisphere = hemisphere

    db.session.commit()
    return jsonify(island.to_dict()), 200
