"""
Candidates list endpoint.
"""

import pandas as pd
from fastapi import APIRouter, HTTPException
from models.schemas import CandidatesResponse, Candidate
from services.shortlist import add_fairness_adjusted_scores
from routes.upload import get_current_dataset

router = APIRouter()


@router.get("/candidates", response_model=CandidatesResponse)
async def get_candidates():
    """
    Get processed candidates list with fairness adjustments.

    Returns:
        CandidatesResponse with all candidates and their scores
    """
    try:
        df = get_current_dataset()

        # Add fairness adjusted scores
        df = add_fairness_adjusted_scores(df)

        # Convert to list of Candidate objects
        candidates = []
        for _, row in df.iterrows():
            candidate = Candidate(
                id=str(row.get('id', '')),
                name=str(row.get('name', 'Unknown')),
                experience=float(row.get('experience', 0)),
                qualification=str(row.get('qualification', 'N/A')),
                gender=str(row.get('gender', 'Not Specified')),
                ethnicity=str(row.get('ethnicity', None)) if 'ethnicity' in row and pd.notna(row['ethnicity']) else None,
                salary_expectation=float(row.get('salary_expectation', 0)) if 'salary_expectation' in row else 0.0,
                score=float(row.get('score', 0)),
                fairnessAdjustedScore=float(row.get('fairnessAdjustedScore', row.get('score', 0)))
            )
            candidates.append(candidate)

        return CandidatesResponse(
            total=len(candidates),
            candidates=candidates
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching candidates: {str(e)}")
