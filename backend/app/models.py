from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    islands = db.relationship("Island", backref="user", lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"id": self.id, "email": self.email, "created_at": self.created_at.isoformat()}


class Island(db.Model):
    __tablename__ = "islands"

    HEMISPHERE_NORTH = "north"
    HEMISPHERE_SOUTH = "south"
    VALID_HEMISPHERES = [HEMISPHERE_NORTH, HEMISPHERE_SOUTH]

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    hemisphere = db.Column(db.String(10), nullable=False, default="north")

    progress = db.relationship(
        "CreopediaProgress", backref="island", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "hemisphere": self.hemisphere,
        }


class Creature(db.Model):
    """Static reference table — populated by the seed script, read-only at runtime."""

    __tablename__ = "creatures"

    CATEGORY_FISH = "fish"
    CATEGORY_BUG = "bug"
    CATEGORY_SEA = "sea_creature"
    VALID_CATEGORIES = [CATEGORY_FISH, CATEGORY_BUG, CATEGORY_SEA]

    id = db.Column(db.Integer, primary_key=True)
    name_fr = db.Column(db.String(100), nullable=False)
    name_en = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(20), nullable=False)
    # JSON: {"north": [1,2,3,...], "south": [7,8,9,...]}
    months_north = db.Column(db.JSON, default=list)
    months_south = db.Column(db.JSON, default=list)
    hours_available = db.Column(db.String(100), default="Toute la journée")
    location = db.Column(db.String(100), default="")
    sell_price = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(255), default="")
    icon_url = db.Column(db.String(255), default="")

    def to_dict(self, hemisphere="north", collected=False):
        months = self.months_north if hemisphere == "north" else self.months_south
        return {
            "id": self.id,
            "name_fr": self.name_fr,
            "name_en": self.name_en,
            "category": self.category,
            "months_available": months,
            "hours_available": self.hours_available,
            "location": self.location,
            "sell_price": self.sell_price,
            "image_url": self.image_url,
            "icon_url": self.icon_url,
            "collected": collected,
        }


class CreopediaProgress(db.Model):
    __tablename__ = "creopedia_progress"

    id = db.Column(db.Integer, primary_key=True)
    island_id = db.Column(db.Integer, db.ForeignKey("islands.id"), nullable=False)
    creature_id = db.Column(db.Integer, db.ForeignKey("creatures.id"), nullable=False)
    collected = db.Column(db.Boolean, default=False)
    collected_date = db.Column(db.DateTime, nullable=True)

    __table_args__ = (
        db.UniqueConstraint("island_id", "creature_id", name="uq_island_creature"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "island_id": self.island_id,
            "creature_id": self.creature_id,
            "collected": self.collected,
            "collected_date": self.collected_date.isoformat() if self.collected_date else None,
        }
