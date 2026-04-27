"""
Fairness metrics calculation engine.

Implements fairness audit metrics:
- Demographic Parity: Selection rate difference between groups
- Equalized Odds: False positive/negative rate parity
- Overall Fairness Score
"""

import pandas as pd
import numpy as np
from typing import Dict, Tuple


def calculate_demographic_parity(df: pd.DataFrame) -> float:
    """
    Calculate demographic parity (selection rate equity).

    Compares selection rates between gender groups.
    Returns value between 0-1, where 1 is perfect parity.
    """
    if 'gender' not in df.columns or 'score' not in df.columns:
        return 1.0

    try:
        # Use top 50% as "selected"
        threshold = df['score'].quantile(0.5)
        df_copy = df.copy()
        df_copy['selected'] = df_copy['score'] >= threshold

        # Calculate selection rate per gender
        groups = df_copy.groupby('gender')['selected'].agg(['sum', 'count'])
        groups['rate'] = groups['sum'] / groups['count']

        if len(groups) < 2:
            return 1.0

        rates = groups['rate'].values
        # Parity: min/max ratio (0-1, where 1 is perfect)
        parity = min(rates) / max(rates) if max(rates) > 0 else 1.0
        return float(np.clip(parity, 0, 1))

    except Exception:
        return 1.0


def calculate_equalized_odds(df: pd.DataFrame) -> float:
    """
    Calculate equalized odds (TPR parity across groups).

    Measures if true positive rates are equal across demographic groups.
    Returns value between 0-1, where 1 is perfect parity.
    """
    if 'gender' not in df.columns or 'experience' not in df.columns or 'score' not in df.columns:
        return 1.0

    try:
        # Use experience as proxy for "qualified"
        df_copy = df.copy()
        df_copy['qualified'] = df_copy['experience'] >= df_copy['experience'].quantile(0.5)
        df_copy['selected'] = df_copy['score'] >= df_copy['score'].quantile(0.5)

        # Calculate TPR per gender
        tprs = []
        for gender in df_copy['gender'].unique():
            gender_data = df_copy[df_copy['gender'] == gender]
            if len(gender_data) > 0 and gender_data['qualified'].sum() > 0:
                tpr = gender_data[gender_data['qualified']]['selected'].sum() / gender_data['qualified'].sum()
                tprs.append(tpr)

        if len(tprs) < 2:
            return 1.0

        # Equalized odds: min/max TPR ratio
        odds_parity = min(tprs) / max(tprs) if max(tprs) > 0 else 1.0
        return float(np.clip(odds_parity, 0, 1))

    except Exception:
        return 1.0


def calculate_bias_risk_level(fairness_score: float, demographic_parity: float, equalized_odds: float) -> str:
    """
    Determine bias risk level based on fairness metrics.

    - High: fairness_score < 60 or either metric < 0.6
    - Medium: fairness_score < 75 or either metric < 0.8
    - Low: otherwise
    """
    if fairness_score < 60 or demographic_parity < 0.6 or equalized_odds < 0.6:
        return "High"
    elif fairness_score < 75 or demographic_parity < 0.8 or equalized_odds < 0.8:
        return "Medium"
    else:
        return "Low"


def calculate_overall_fairness_score(df: pd.DataFrame) -> float:
    """
    Calculate overall fairness score (0-100).

    Weighted combination of:
    - Demographic Parity (40%)
    - Equalized Odds (40%)
    - Representation balance (20%)
    """
    try:
        dp = calculate_demographic_parity(df)
        eo = calculate_equalized_odds(df)

        # Representation: check if all genders are represented in top 50%
        if 'gender' in df.columns and 'score' in df.columns:
            threshold = df['score'].quantile(0.5)
            top_candidates = df[df['score'] >= threshold]
            genders_in_top = top_candidates['gender'].nunique()
            genders_total = df['gender'].nunique()
            representation = genders_in_top / genders_total if genders_total > 0 else 1.0
        else:
            representation = 1.0

        # Weighted score
        score = (dp * 0.4 + eo * 0.4 + representation * 0.2) * 100
        return float(np.clip(score, 0, 100))

    except Exception:
        return 50.0  # Default middle value on error


def get_fairness_metrics(df: pd.DataFrame) -> Dict:
    """
    Calculate all fairness metrics for the dataset.

    Returns:
        Dictionary with fairness metrics
    """
    dp = calculate_demographic_parity(df)
    eo = calculate_equalized_odds(df)
    fs = calculate_overall_fairness_score(df)
    risk = calculate_bias_risk_level(fs, dp, eo)

    return {
        "fairnessScore": round(fs, 2),
        "demographicParity": round(dp, 3),
        "equalizedOdds": round(eo, 3),
        "biasRiskLevel": risk,
        "metricsDebug": {
            "totalCandidates": len(df),
            "genderGroups": int(df['gender'].nunique()) if 'gender' in df.columns else 0,
        }
    }


# New deterministic scoring functions
def parse_qualification_level(qualification: str) -> float:
    """
    Parse degree level from qualification string.

    Returns normalized qualification score (0-1):
    - BS/BA: 0.5
    - MS/MA: 0.75
    - MBA: 0.8
    - PhD: 1.0
    - Default: 0.5
    """
    if not qualification or not isinstance(qualification, str):
        return 0.5

    qual_lower = qualification.lower()

    if 'phd' in qual_lower or 'doctorate' in qual_lower:
        return 1.0
    elif 'mba' in qual_lower:
        return 0.8
    elif 'ms' in qual_lower or 'ma' in qual_lower or 'master' in qual_lower:
        return 0.75
    elif 'bs' in qual_lower or 'ba' in qual_lower or 'bachelor' in qual_lower:
        return 0.5
    else:
        return 0.5


def calculate_salary_fit(salary_expectation: float, max_salary: float) -> float:
    """
    Calculate salary fit score (inverse relationship).

    Lower salary expectation = better fit within budget.
    Formula: 1.0 - (salary / max_salary) clamped to [0, 1]
    """
    if max_salary <= 0 or salary_expectation <= 0:
        return 0.5

    fit = 1.0 - (salary_expectation / max_salary)
    return float(np.clip(fit, 0, 1))


def calculate_deterministic_score(candidate_row, max_experience: float, max_salary: float) -> Tuple[float, Dict]:
    """
    Calculate deterministic candidate score with decision factors breakdown.

    Formula: (experience_pct * 0.5 + qualification * 0.3 + salary_fit * 0.2) * 100

    Args:
        candidate_row: Row from DataFrame containing experience, qualification, salary_expectation
        max_experience: Maximum experience value in dataset for normalization
        max_salary: Maximum salary in dataset for normalization

    Returns:
        Tuple of (score: 0-100, factors: Dict with component breakdown)
    """
    try:
        experience = float(candidate_row.get('experience', 0))
        qualification = str(candidate_row.get('qualification', ''))
        salary = float(candidate_row.get('salary_expectation', 0))

        # Calculate normalized components
        experience_pct = experience / max_experience if max_experience > 0 else 0
        qualification_score = parse_qualification_level(qualification)
        salary_fit = calculate_salary_fit(salary, max_salary)

        # Weighted score
        score = (experience_pct * 0.5 + qualification_score * 0.3 + salary_fit * 0.2) * 100

        factors = {
            'experience': round(experience_pct, 3),
            'qualification': round(qualification_score, 3),
            'salary_fit': round(salary_fit, 3),
            'fairness_adjustment': 0.0  # Will be set separately by fairness engine
        }

        return float(round(score, 2)), factors

    except Exception as e:
        # Fallback on error
        return 50.0, {'experience': 0, 'qualification': 0.5, 'salary_fit': 0.5, 'fairness_adjustment': 0.0}


def calculate_candidate_confidence(score: float, qualification_score: float, experience_ratio: float) -> float:
    """
    Calculate confidence score for candidate viability.

    Formula: (score/100 * 0.4 + qualification * 0.4 + experience_ratio * 0.2) * 100

    Represents: How confident we are in this candidate's overall fit
    """
    try:
        confidence = (score / 100 * 0.4 + qualification_score * 0.4 + experience_ratio * 0.2) * 100
        return float(np.clip(confidence, 0, 100))
    except Exception:
        return 50.0


def calculate_gender_influence(original_score: float, adjusted_score: float) -> float:
    """
    Calculate the percentage impact of fairness adjustment on score.

    Formula: ((adjusted_score - original_score) / original_score) * 100

    Returns: Percentage change (typically ±0-5% since fairness boost is capped at 5%)
    """
    if original_score <= 0:
        return 0.0

    try:
        influence = ((adjusted_score - original_score) / original_score) * 100
        return float(round(influence, 2))
    except Exception:
        return 0.0
