"""
Fairness metrics endpoint.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
from models.schemas import MetricsResponse
from services.fairness_engine import get_fairness_metrics
from routes.upload import get_current_dataset

router = APIRouter()


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    """
    Get fairness metrics for the currently loaded dataset.

    Returns:
        MetricsResponse with fairness scores and risk assessment
    """
    try:
        df = get_current_dataset()

        # Calculate metrics
        metrics = get_fairness_metrics(df)

        return MetricsResponse(
            fairnessScore=metrics["fairnessScore"],
            demographicParity=metrics["demographicParity"],
            equalizedOdds=metrics["equalizedOdds"],
            biasRiskLevel=metrics["biasRiskLevel"],
            lastUpdated=datetime.now().isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating metrics: {str(e)}")
