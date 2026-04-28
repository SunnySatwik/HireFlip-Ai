"""
Audit report endpoint.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
from models.schemas import ReportResponse
from services.fairness_engine import get_fairness_metrics
from routes.upload import get_current_dataset

router = APIRouter()


@router.get("/report", response_model=ReportResponse)
async def get_report():
    """
    Generate comprehensive fairness audit report.

    Returns:
        ReportResponse with audit summary and recommendations
    """
    try:
        df = get_current_dataset()

        # Calculate metrics
        metrics = get_fairness_metrics(df)

        # Generate recommendations based on metrics
        recommendations = generate_recommendations(metrics, df)

        # Create summary
        summary = create_audit_summary(metrics, len(df))

        return ReportResponse(
            auditDate=datetime.now().isoformat(),
            totalCandidates=len(df),
            fairnessMetrics={
                "fairnessScore": metrics["fairnessScore"],
                "demographicParity": metrics["demographicParity"],
                "equalizedOdds": metrics["equalizedOdds"],
                "biasRiskLevel": metrics["biasRiskLevel"],
            },
            summary=summary,
            recommendations=recommendations
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")


def generate_recommendations(metrics: dict, df) -> list:
    """
    Generate actionable recommendations based on fairness metrics.

    Args:
        metrics: Dictionary of fairness metrics
        df: Candidate dataframe

    Returns:
        List of recommendations
    """
    recommendations = []
    fairness_score = metrics["fairnessScore"]
    dp = metrics["demographicParity"]
    eo = metrics["equalizedOdds"]
    risk = metrics["biasRiskLevel"]

    # High-level recommendations
    if risk == "High":
        recommendations.append(
            "Critical: High bias risk detected. Review scoring methodology and selection criteria."
        )

    if dp < 0.7:
        recommendations.append(
            "Demographic parity is below 0.7. Consider reviewing job requirements and evaluation criteria for potential barriers."
        )

    if eo < 0.7:
        recommendations.append(
            "Equalized odds metric is low. True positive rates vary significantly across demographic groups."
        )

    if fairness_score < 70:
        recommendations.append(
            "Overall fairness score is below 70. Implement diversity-conscious hiring practices."
        )

    if fairness_score >= 80:
        recommendations.append(
            "Strong fairness metrics detected. Continue current evaluation practices."
        )

    if risk == "Low":
        recommendations.append(
            "Low bias risk: Selection process appears fair across demographic groups."
        )

    # Group-specific recommendations (Indian Market focus: Caste)
    demographic_col = 'caste' if 'caste' in df.columns else ('gender' if 'gender' in df.columns else None)
    if demographic_col:
        counts = df[demographic_col].value_counts()
        if len(counts) > 1:
            max_group = counts.max()
            min_group = counts.min()
            if min_group / max_group < 0.2: # Stricter for caste categories
                recommendations.append(
                    f"Significant imbalance in {demographic_col} demographics. Consider targeted outreach to underrepresented categories (SC/ST/OBC/EWS)."
                )

    return recommendations[:5]  # Return top 5 recommendations


def create_audit_summary(metrics: dict, total_candidates: int) -> str:
    """
    Create a human-readable audit summary.

    Args:
        metrics: Dictionary of fairness metrics
        total_candidates: Total number of candidates

    Returns:
        Summary string
    """
    score = metrics["fairnessScore"]
    risk = metrics["biasRiskLevel"]

    if score >= 80:
        assessment = "Excellent fairness metrics"
    elif score >= 70:
        assessment = "Good fairness metrics"
    elif score >= 60:
        assessment = "Fair fairness metrics with some concerns"
    else:
        assessment = "Poor fairness metrics requiring attention"

    return (
        f"Audit of {total_candidates} candidates: {assessment}. "
        f"Fairness Score: {score}/100, Risk Level: {risk}. "
        f"Demographic Parity: {metrics['demographicParity']:.2%}, "
        f"Equalized Odds: {metrics['equalizedOdds']:.2%}."
    )
