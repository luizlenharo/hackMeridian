from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class CertificationType(str, Enum):
    VEGAN = "vegan"
    GLUTEN_FREE = "gluten_free"
    SEAFOOD_FREE = "seafood_free"
    KOSHER = "kosher"
    HALAL = "halal"


class CertificationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# Restaurant Models
class RestaurantCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    address: str = Field(..., min_length=10, max_length=200)


class Restaurant(BaseModel):
    id: int
    name: str
    address: str
    stellar_public_key: str
    created_at: datetime
    certifications: list[dict] = []


# Certification Models
class CertificationRequest(BaseModel):
    restaurant_id: int
    certification_type: CertificationType
    products: list[str] = Field(..., min_items=1)
    documentation: Optional[list[str]] = []
    notes: Optional[str] = Field(None, max_length=500)


class Certification(BaseModel):
    id: int
    restaurant_id: int
    certification_type: CertificationType
    products: list[str]
    status: CertificationStatus
    auditor_id: Optional[str]
    issued_at: Optional[datetime]
    expires_at: Optional[datetime]
    transaction_hash: Optional[str]
    notes: Optional[str]
    created_at: datetime


# Auditor Models
class AuditorCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str
    specializations: list[CertificationType]


class Auditor(BaseModel):
    id: int
    name: str
    email: str
    specializations: list[CertificationType]
    stellar_public_key: str
    is_active: bool
    certifications_issued: int
    created_at: datetime


class AuditDecision(BaseModel):
    certification_id: int
    approved: bool
    notes: Optional[str] = Field(None, max_length=500)


# Response Models
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None


class PaginatedResponse(BaseModel):
    items: list[dict]
    total: int
    page: int
    size: int
    pages: int


# Search and Filter Models
class RestaurantFilter(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    certifications: Optional[list[CertificationType]] = None
    page: int = Field(1, ge=1)
    size: int = Field(10, ge=1, le=100)
