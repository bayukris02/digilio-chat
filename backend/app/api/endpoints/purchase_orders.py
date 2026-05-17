from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
import logging

from app.db.session import SessionLocal
from app.models.purchase_order import PurchaseOrder
from app.models.audit_log import AuditLog
from app.schemas.purchase_order import POCreate, POResponse

router = APIRouter()
logger = logging.getLogger(__name__)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# SIMULATED DYNAMIC RULE ENGINE (Metadata-driven)
# In Phase 7, this will come from a JSON field in the Tenant table
DEFAULT_RULES = {
    "purchase_order": {
        "mandatory_fields": ["vendor_name", "item_name", "quantity"],
        "max_total_amount": 10000000 # 10 Million limit
    }
}

@router.post("/purchase-orders", response_model=POResponse)
def create_purchase_order(po_in: POCreate, db: Session = Depends(get_db)):
    # 0. BACKEND GUARD: RBAC Check (Hard-coded for prototype)
    if po_in.user_role == "finance":
         raise HTTPException(
            status_code=403,
            detail="Otorisasi Gagal: Role Finance tidak diizinkan membuat PO baru. Silakan hubungi admin atau operator."
        )

    rules = DEFAULT_RULES["purchase_order"]
    
    # 1. DYNAMIC GUARDRAIL: Mandatory Check
    missing = [f for f in rules["mandatory_fields"] if not getattr(po_in, f)]
    if missing:
        raise HTTPException(
            status_code=400, 
            detail=f"Aturan Bisnis: Kolom berikut wajib diisi: {', '.join(missing)}"
        )
    
    # 2. DYNAMIC GUARDRAIL: Hard Budgeting
    total = (po_in.quantity or 0) * (po_in.price or 0)
    if total > rules["max_total_amount"]:
        raise HTTPException(
            status_code=403,
            detail=f"Budget Exceeded! Total PO ({total:,}) melebihi batas limit per transaksi ({rules['max_total_amount']:,})."
        )

    # 3. Create PO Record
    db_po = PurchaseOrder(
        **po_in.dict(exclude={"user_command"}),
        total_amount=total,
        status="SUBMITTED"
    )
    db.add(db_po)
    db.flush() # Get ID before commit

    # 4. AUDIT TRAIL: Log AI Action
    audit = AuditLog(
        tenant_id=po_in.tenant_id,
        user_id=po_in.created_by,
        action="CREATE",
        entity_type="PURCHASE_ORDER",
        entity_id=db_po.id,
        user_command=po_in.user_command,
        changes=po_in.dict(include={"vendor_name", "item_name", "quantity", "price"})
    )
    db.add(audit)
    
    db.commit()
    db.refresh(db_po)
    return db_po

@router.get("/purchase-orders", response_model=List[POResponse])
def list_purchase_orders(tenant_id: str, db: Session = Depends(get_db)):
    # Simple tenant isolation
    return db.query(PurchaseOrder).filter(PurchaseOrder.tenant_id == tenant_id).all()
