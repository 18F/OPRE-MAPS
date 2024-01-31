from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional


@dataclass(kw_only=True)
class RequestBody:
    number: Optional[int] = None
    # optional = Column(Boolean, default=False)
    description: Optional[str] = None
    period_start: Optional[date] = field(default=None, metadata={"format": "%Y-%m-%d"})
    period_end: Optional[date] = field(default=None, metadata={"format": "%Y-%m-%d"})
    # contract_agreement_id = Optional[int] = None
    clin_id: Optional[int] = None


@dataclass(kw_only=True)
class POSTRequestBody(RequestBody):
    contract_agreement_id: int  # agreement_id is required for POST
    number: int  # number is required for POST


@dataclass(kw_only=True)
class PATCHRequestBody(RequestBody):
    contract_agreement_id: Optional[int] = None  # agreement_id (and all params) are optional for PATCH


@dataclass
class QueryParameters:
    contract_agreement_id: Optional[int] = None


@dataclass
class ServicesComponentItemResponse:
    id: int
    contract_agreement_id: int
    number: int
    description: str
    clin_id: int
    created_by: int
    created_on: datetime = field(default=None, metadata={"format": "%Y-%m-%dT%H:%M:%S.%fZ"})
    updated_on: datetime = field(default=None, metadata={"format": "%Y-%m-%dT%H:%M:%S.%fZ"})
    period_start: date = field(default=None, metadata={"format": "%Y-%m-%d"})
    period_end: date = field(default=None, metadata={"format": "%Y-%m-%d"})
