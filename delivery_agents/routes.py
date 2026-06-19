from flask import Blueprint, jsonify, request

from delivery_agents.service import (
    assign_agent,
    get_assigned_shipments,
    submit_delivery_proof,
    update_shipment_status,
)
from delivery_agents.utils import require_roles

delivery_agents_bp = Blueprint("delivery_agents", __name__)


@delivery_agents_bp.get("/agent/shipments")
@require_roles("agent")
def agent_shipments():
    shipments = get_assigned_shipments()
    return jsonify({"shipments": shipments}), 200


@delivery_agents_bp.put("/shipments/<shipment_id>/assign-agent")
@require_roles("admin")
def assign_shipment_agent(shipment_id):
    payload = request.get_json(silent=True) or {}
    agent_id = payload.get("agent_id")
    if not agent_id:
        return jsonify({"error": "agent_id is required"}), 400

    shipment = assign_agent(shipment_id=shipment_id, agent_id=agent_id)
    return jsonify({"shipment": shipment}), 200


@delivery_agents_bp.put("/shipments/<shipment_id>/status")
@require_roles("agent")
def change_shipment_status(shipment_id):
    payload = request.get_json(silent=True) or {}
    status = payload.get("status")
    if not status:
        return jsonify({"error": "status is required"}), 400

    shipment = update_shipment_status(shipment_id=shipment_id, status=status)
    return jsonify({"shipment": shipment}), 200


@delivery_agents_bp.post("/shipments/<shipment_id>/proof")
@require_roles("agent")
def add_delivery_proof(shipment_id):
    payload = request.get_json(silent=True) or {}
    proof_text = payload.get("proof_text")
    if not proof_text:
        return jsonify({"error": "proof_text is required"}), 400

    proof = submit_delivery_proof(
        shipment_id=shipment_id,
        proof_text=proof_text,
    )
    return jsonify({"proof": proof}), 201
