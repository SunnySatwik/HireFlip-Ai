"""
Shortlist comparison endpoint.
"""

from fastapi import APIRouter, HTTPException, Depends
from models.schemas import ShortlistResponse, Candidate
import pandas as pd
from services.shortlist import get_shortlist_comparison
from services.fairness_engine import calculate_candidate_confidence, calculate_gender_influence
from routes.upload import get_current_dataset

router = APIRouter()


@router.get("/shortlist", response_model=ShortlistResponse)
async def get_shortlist(df: pd.DataFrame = Depends(get_current_dataset)):
    """
    Get original vs fairness-adjusted shortlist comparison with decision factors.

    Returns:
        ShortlistResponse with both shortlists, decision factors, and comparison details
    """
    try:
        # Get shortlist comparison
        comparison = get_shortlist_comparison(df, top_n=10)

        # Calculate max experience for confidence calculation
        max_exp = df['experience'].max() if df['experience'].max() > 0 else 1

        # Convert to Candidate objects with decision factors
        def df_to_candidates(slist_df):
            candidates = []
            for _, row in slist_df.iterrows():
                # Get decision factors
                decision_factors = row.get('decisionFactors')
                if decision_factors is None:
                    decision_factors = {
                        'experience': 0.0,
                        'qualification': 0.5,
                        'salary_fit': 0.5,
                        'fairness_adjustment': 0.0
                    }
                elif isinstance(decision_factors, dict):
                    decision_factors = dict(decision_factors)
                else:
                    decision_factors = {
                        'experience': 0.0,
                        'qualification': 0.5,
                        'salary_fit': 0.5,
                        'fairness_adjustment': 0.0
                    }

                # Calculate fairness metrics
                original_score = float(row.get('score', 0))
                adjusted_score = float(row.get('fairnessAdjustedScore', original_score))

                confidence = calculate_candidate_confidence(
                    score=original_score,
                    qualification_score=decision_factors.get('qualification', 0.5),
                    experience_ratio=float(row.get('experience', 0)) / max_exp if max_exp > 0 else 0
                )

                gender_influence = calculate_gender_influence(original_score, adjusted_score)
                decision_factors['fairness_adjustment'] = gender_influence

                candidate = Candidate(
                    id=str(row.get('id', '')),
                    name=str(row.get('name', 'Unknown')),
                    experience=float(row.get('experience', 0)),
                    qualification=str(row.get('qualification', 'N/A')),
                    gender=str(row.get('gender', 'Not Specified')),
                    ethnicity=str(row.get('ethnicity', None)) if 'ethnicity' in row and pd.notna(row['ethnicity']) else None,
                    caste=str(row.get('caste', None)) if 'caste' in row and pd.notna(row['caste']) else None,
                    salary_expectation=float(row.get('salary_expectation', 0)) if 'salary_expectation' in row else 0.0,
                    score=original_score,
                    fairnessAdjustedScore=adjusted_score,
                    status="Shortlisted",  # Only shortlisted candidates in this response
                    confidence=confidence,
                    genderInfluence=gender_influence,
                    decisionFactors=decision_factors
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
