"""
Shortlist comparison endpoint.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import ShortlistResponse, Candidate
import pandas as pd
from services.shortlist import get_shortlist_comparison
from routes.upload import get_current_dataset

router = APIRouter()


@router.get("/shortlist", response_model=ShortlistResponse)
async def get_shortlist():
    """
    Get original vs fairness-adjusted shortlist comparison.

    Returns:
        ShortlistResponse with both shortlists and comparison details
    """
    try:
        df = get_current_dataset()

        # Get shortlist comparison
        comparison = get_shortlist_comparison(df, top_n=10)

        # Convert to Candidate objects
        def df_to_candidates(slist_df):
            candidates = []
            for _, row in slist_df.iterrows():
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
            return candidates

        original_candidates = df_to_candidates(comparison["original"])
        adjusted_candidates = df_to_candidates(comparison["adjusted"])

        return ShortlistResponse(
            originalCount=len(original_candidates),
            original=original_candidates,
            fairnessAdjustedCount=len(adjusted_candidates),
            fairnessAdjusted=adjusted_candidates,
            adjustments=comparison["adjustments"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching shortlist: {str(e)}")
