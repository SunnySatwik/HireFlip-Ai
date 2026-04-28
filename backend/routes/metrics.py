"""
Fairness metrics endpoint.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
from models.schemas import MetricsResponse
from services.fairness_engine import get_fairness_metrics
from services.shortlist import add_fairness_adjusted_scores
from routes.upload import get_current_dataset

router = APIRouter()


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    """
    Get fairness metrics for the final processed candidate results.
    Refined for business dashboard realism and small dataset sensitivity.
    """
    try:
        df = get_current_dataset()
        df = add_fairness_adjusted_scores(df)
        
        dataset_size = len(df)
        is_small_dataset = dataset_size < 30
        
        # Use fairnessAdjustedScore as the ground truth
        score_col = 'fairnessAdjustedScore'
        demographic_col = 'caste' if 'caste' in df.columns else ('gender' if 'gender' in df.columns else None)
        
        # 1. Define selection bands
        shortlist_threshold = 80.0
        df['is_shortlisted'] = df[score_col] >= shortlist_threshold
        df['is_promising'] = df[score_col] >= 60.0
        
        # 2. Calculate Demographic Parity (Practical Shortlist Rates)
        dp = 1.0
        if demographic_col:
            group_rates = df.groupby(demographic_col)['is_shortlisted'].mean()
            if len(group_rates) > 1:
                max_rate = group_rates.max()
                min_rate = group_rates.min()
                # Moderated smoothing for small datasets to avoid punitive collapse
                epsilon = 0.25 if is_small_dataset else 0.1
                dp = (min_rate + epsilon) / (max_rate + epsilon) if max_rate > 0 else 1.0
        
        # 3. Selection Consistency (Practical funnel balance)
        sc = 1.0
        if demographic_col:
            group_promising_rates = df.groupby(demographic_col)['is_promising'].mean()
            if len(group_promising_rates) > 1:
                max_p_rate = group_promising_rates.max()
                min_p_rate = group_promising_rates.min()
                # Business-friendly smoothing: rewards presence of multiple groups
                p_epsilon = 0.35 if is_small_dataset else 0.15
                sc = (min_p_rate + p_epsilon) / (max_p_rate + p_epsilon) if max_p_rate > 0 else 1.0

        # 4. Overall Fairness Score
        # Combination of DP, SC and multi-group representation
        representation = 1.0
        groups_total = 1
        if demographic_col:
            groups_in_pipeline = df[df['is_promising']][demographic_col].nunique()
            groups_total = df[demographic_col].nunique()
            # Score representation based on funnel (Shortlist + In Review)
            representation = groups_in_pipeline / groups_total if groups_total > 0 else 1.0
            
        # Weighted score: heavily weighted towards having a "Mixed Pipeline"
        fairness_score = (dp * 0.35 + sc * 0.35 + representation * 0.3) * 100
        
        # Business Realism: If we have at least 3 groups in the pipeline, the score 
        # shouldn't be "High Risk" unless parity is extremely bad.
        if is_small_dataset and groups_total > 2 and representation > 0.6:
            fairness_score = max(fairness_score, 65.0)

        # 5. Logical Bias Risk Mapping
        # 80+ Low, 60-79 Moderate, <60 High
        if fairness_score >= 80:
            risk = "Low"
        elif fairness_score >= 60:
            risk = "Moderate"
        else:
            risk = "High"

        # Calculate analytics for charts
        metrics_from_engine = get_fairness_metrics(df)

        return MetricsResponse(
            fairnessScore=round(fairness_score, 2),
            demographicParity=round(dp, 3),
            equalizedOdds=round(sc, 3), # Map SC to UI compatibility
            biasRiskLevel=risk,
            lastUpdated=datetime.now().isoformat(),
            acceptanceTrend=metrics_from_engine.get("acceptanceTrend"),
            demographicDistribution=metrics_from_engine.get("demographicDistribution")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating metrics: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating metrics: {str(e)}")
