from datetime import datetime

from app.database import Base
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    address = Column(String(200), nullable=False)
    stellar_public_key = Column(String(56), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    # Relacionamentos
    certifications = relationship("Certification", back_populates="restaurant")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    certification_type = Column(String(20), nullable=False)
    products = Column(Text, nullable=False)  # Lista de produtos em formato JSON
    status = Column(String(20), nullable=False)
    auditor_id = Column(Integer, ForeignKey("auditors.id"), nullable=True)
    issued_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    transaction_hash = Column(String(64), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    # Relacionamentos
    restaurant = relationship("Restaurant", back_populates="certifications")
    auditor = relationship("Auditor", back_populates="certifications")


class Auditor(Base):
    __tablename__ = "auditors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    specializations = Column(Text, nullable=False)  # Lista em formato JSON
    stellar_public_key = Column(String(56), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    certifications_issued = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)

    # Relacionamentos
    certifications = relationship("Certification", back_populates="auditor")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    stellar_public_key = Column(String(56), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.now)