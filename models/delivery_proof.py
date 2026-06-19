from datetime import datetime, timezone

from extensions import db


class DeliveryProof(db.Model):
    __tablename__ = "delivery_proofs"

    id = db.Column(db.Integer, primary_key=True)
    shipment_id = db.Column(
        db.Integer,
        db.ForeignKey("shipments.id"),
        nullable=False,
        index=True,
    )
    proof_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
