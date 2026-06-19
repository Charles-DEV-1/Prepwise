from datetime import datetime, timezone

from werkzeug.exceptions import Forbidden, NotFound

from delivery_agents.utils import (
    create_tracking_history,
    get_current_user,
    serialize_delivery_proof,
    serialize_shipment,
)
from extensions import db
from models.delivery_proof import DeliveryProof
from models.shipment import Shipment
from models.user import User


def get_assigned_shipments():
    user = get_current_user()
    shipments = Shipment.query.filter_by(agent_id=user.id).all()
    return [serialize_shipment(shipment) for shipment in shipments]


def assign_agent(shipment_id, agent_id):
    shipment = _get_shipment(shipment_id)
    agent = User.query.get(agent_id)

    if agent is None:
        raise NotFound("Delivery agent not found")

    if getattr(agent, "role", None) != "agent":
        raise Forbidden("User is not a delivery agent")

    shipment.agent_id = agent.id
    create_tracking_history(
        shipment=shipment,
        status=getattr(shipment, "status", None),
        message=f"Assigned to delivery agent {agent.id}",
    )
    db.session.commit()

    return serialize_shipment(shipment)


def update_shipment_status(shipment_id, status):
    shipment = _get_agent_shipment(shipment_id)
    shipment.status = status
    create_tracking_history(
        shipment=shipment,
        status=status,
        message=f"Shipment status updated to {status}",
    )
    db.session.commit()

    return serialize_shipment(shipment)


def submit_delivery_proof(shipment_id, proof_text):
    shipment = _get_agent_shipment(shipment_id)

    proof = DeliveryProof(
        shipment_id=shipment.id,
        proof_text=proof_text,
        created_at=datetime.now(timezone.utc),
    )
    db.session.add(proof)

    create_tracking_history(
        shipment=shipment,
        status=getattr(shipment, "status", None),
        message="Delivery proof submitted",
    )
    db.session.commit()

    return serialize_delivery_proof(proof)


def _get_shipment(shipment_id):
    shipment = Shipment.query.get(shipment_id)
    if shipment is None:
        raise NotFound("Shipment not found")
    return shipment


def _get_agent_shipment(shipment_id):
    user = get_current_user()
    shipment = _get_shipment(shipment_id)

    if str(getattr(shipment, "agent_id", "")) != str(user.id):
        raise Forbidden("You can only access assigned shipments")

    return shipment
