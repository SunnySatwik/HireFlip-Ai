"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class UploadResponse(BaseModel):
    """Response from CSV upload endpoint."""
    success: bool
    rowCount: int
    columns: List[str]
    message: str


class MetricsResponse(BaseModel):
    """Response from metrics endpoint."""
    fairnessScore: float  # 0-100
    demographicParity: float  # 0-1
    equalizedOdds: float  # 0-1
    biasRiskLevel: str  # "Low", "Medium", "High"
    lastUpdated: str


class Candidate(BaseModel):
    """Individual candidate record."""
    id: str
    name: str
    experience: float
    qualification: str
    gender: str
    ethnicity: Optional[str]
    salary_expectation: float
    score: float
    fairnessAdjustedScore: float
    status: Optional[str] = "In Review"  # Shortlisted, In Review, Rejected
    confidence: Optional[float] = 50.0  # 0-100
    genderInfluence: Optional[float] = 0.0  # Percentage impact of fairness adjustment
    decisionFactors: Optional[Dict[str, float]] = None  # {experience, qualification, salary_fit, fairness_adjustment}


class CandidatesResponse(BaseModel):
    """Response from candidates endpoint."""
    total: int
    candidates: List[Candidate]


class ShortlistResponse(BaseModel):
    """Response from shortlist endpoint."""
    originalCount: int
    original: List[Candidate]
    fairnessAdjustedCount: int
    fairnessAdjusted: List[Candidate]
    adjustments: Dict[str, Any]


class ReportResponse(BaseModel):
    """Response from report endpoint."""
    auditDate: str
    totalCandidates: int
    fairnessMetrics: Dict[str, Any]
    summary: str
    recommendations: List[str]
