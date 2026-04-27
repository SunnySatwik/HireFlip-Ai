"""
Candidates list endpoint.
"""

import pandas as pd
from fastapi import APIRouter, HTTPException
from models.schemas import CandidatesResponse, Candidate
from services.shortlist import add_fairness_adjusted_scores, classify_candidate_status
from services.fairness_engine import calculate_candidate_confidence, calculate_gender_influence
from routes.upload import get_current_dataset

router = APIRouter()


@router.get("/candidates", response_model=CandidatesResponse)
async def get_candidates():
    """
    Get processed candidates list with fairness adjustments and decision factors.

    Returns:
        CandidatesResponse with all candidates and their scores, status, confidence, and decision factors
    """
    try:
        df = get_current_dataset()

        # Add fairness adjusted scores
        df = add_fairness_adjusted_scores(df)

        # Classify candidates into status groups
        statuses = classify_candidate_status(df, 'fairnessAdjustedScore')
        df['status'] = statuses

        # Calculate max experience for confidence calculation
        max_exp = df['experience'].max() if df['experience'].max() > 0 else 1

        # Convert to list of Candidate objects
        candidates = []
        for idx, (_, row) in enumerate(df.iterrows()):
            # Get decision factors from row or calculate
            decision_factors = row.get('decisionFactors')
            if decision_factors is None:
                decision_factors = {
                    'experience': 0.0,
                    'qualification': 0.5,
                    'salary_fit': 0.5,
                    'fairness_adjustment': 0.0
                }
            elif isinstance(decision_factors, dict):
                decision_factors = dict(decision_factors)  # Make copy
            else:
                decision_factors = {
                    'experience': 0.0,
                    'qualification': 0.5,
                    'salary_fit': 0.5,
                    'fairness_adjustment': 0.0
                }

            # Calculate fairness adjustment impact
            original_score = float(row.get('score', 0))
            adjusted_score = float(row.get('fairnessAdjustedScore', original_score))

            # Calculate confidence and gender influence
            confidence = calculate_candidate_confidence(
                score=float(row.get('score', 0)),
                qualification_score=decision_factors.get('qualification', 0.5),
                experience_ratio=float(row.get('experience', 0)) / max_exp if max_exp > 0 else 0
            )

            gender_influence = calculate_gender_influence(original_score, adjusted_score)

            # Update decision factors with fairness adjustment
            decision_factors['fairness_adjustment'] = gender_influence

            candidate = Candidate(
                id=str(row.get('id', '')),
                name=str(row.get('name', 'Unknown')),
                experience=float(row.get('experience', 0)),
                qualification=str(row.get('qualification', 'N/A')),
                gender=str(row.get('gender', 'Not Specified')),
                ethnicity=str(row.get('ethnicity', None)) if 'ethnicity' in row and pd.notna(row['ethnicity']) else None,
                salary_expectation=float(row.get('salary_expectation', 0)) if 'salary_expectation' in row else 0.0,
                score=original_score,
                fairnessAdjustedScore=adjusted_score,
                status=row.get('status', 'In Review'),
                confidence=confidence,
                genderInfluence=gender_influence,
                decisionFactors=decision_factors
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
