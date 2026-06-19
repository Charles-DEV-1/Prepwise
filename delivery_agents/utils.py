from datetime import datetime, timezone
from functools import wraps

from flask import jsonify
from flask_login import current_user

from extensions import db
from models.tracking_history import TrackingHistory


def get_current_user():
    if not current_user or not current_user.is_authenticated:
        return None
    return current_user


def require_roles(*roles):
    def decorator(view):
        @wraps(view)
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if user is None:
                return jsonify({"error": "Authentication required"}), 401

            if getattr(user, "role", None) not in roles:
                return jsonify({"error": "Forbidden"}), 403

            return view(*args, **kwargs)

        return wrapper

    return decorator


def create_tracking_history(shipment, status, message):
    entry = TrackingHistory(
        shipment_id=shipment.id,
        status=status,
        message=message,
        created_at=datetime.now(timezone.utc),
    )
    db.session.add(entry)
    return entry


def serialize_shipment(shipment):
    if hasattr(shipment, "to_dict"):
        return shipment.to_dict()

    return {
        "id": shipment.id,
        "agent_id": getattr(shipment, "agent_id", None),
        "status": getattr(shipment, "status", None),
        "created_at": _iso_or_none(getattr(shipment, "created_at", None)),
        "updated_at": _iso_or_none(getattr(shipment, "updated_at", None)),
    }


def serialize_delivery_proof(proof):
    return {
        "id": proof.id,
        "shipment_id": proof.shipment_id,
        "proof_text": proof.proof_text,
        "created_at": _iso_or_none(proof.created_at),
    }


def _iso_or_none(value):
    return value.isoformat() if value else None
