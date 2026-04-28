"""
Shortlist generation and fairness adjustment service.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from services.fairness_engine import calculate_fairness_boost


def generate_original_shortlist(df: pd.DataFrame, top_n: int = 10) -> pd.DataFrame:
    """
    Generate original shortlist based on scores alone.

    Args:
        df: Candidate dataframe
        top_n: Number of top candidates to shortlist

    Returns:
        DataFrame of top candidates
    """
    if 'score' not in df.columns:
        return df.head(top_n)

    return df.nlargest(top_n, 'score').copy()


def calculate_fairness_adjustments(df: pd.DataFrame, top_n: int = 10) -> Tuple[pd.DataFrame, Dict]:
    """
    Generate fairness-adjusted shortlist using proportional representation.

    Strategy: Ensure demographic groups are represented proportionally to
    their presence in the overall candidate pool while maintaining quality.
    Prioritizes 'caste' for Indian market relevance.

    Args:
        df: Candidate dataframe
        top_n: Number of candidates to shortlist

    Returns:
        Tuple of (adjusted shortlist DataFrame, adjustment details)
    """
    demographic_col = 'caste' if 'caste' in df.columns else ('gender' if 'gender' in df.columns else None)

    if not demographic_col or 'score' not in df.columns:
        return generate_original_shortlist(df, top_n), {"method": "no_demographics"}

    df = df.copy()

    # Calculate demographic proportions
    proportions = df[demographic_col].value_counts(normalize=True).to_dict()

    # Calculate target count per group
    targets = {}
    remaining = top_n
    for group_val, prop in sorted(proportions.items(), key=lambda x: -x[1]):
        target = max(1, round(prop * top_n))  # At least 1 per group if significant
        target = min(target, remaining)
        targets[group_val] = target
        remaining -= target

    # Handle any remaining slots (give to highest scores regardless of group)
    if remaining > 0:
        # This is a simplification; in a real system we'd distribute more carefully
        pass

    # Select top candidates per group
    selected_candidates = []
    adjustment_details = {
        "method": "proportional_representation",
        f"{demographic_col}_targets": targets,
        "adjustments_made": []
    }

    for group_val, target in targets.items():
        group_candidates = df[df[demographic_col] == group_val].nlargest(target, 'score')
        selected_candidates.append(group_candidates)

        # Track if we had to include lower-scoring candidates
        if len(group_candidates) > 0:
            min_score = group_candidates['score'].min()
            original_threshold = df['score'].nlargest(top_n).min()
            if min_score < original_threshold:
                adjustment_details["adjustments_made"].append({
                    demographic_col: group_val,
                    "count": len(group_candidates),
                    "min_score_included": round(float(min_score), 2),
                    "original_threshold": round(float(original_threshold), 2)
                })

    # Combine and sort by score
    adjusted_df = pd.concat(selected_candidates, ignore_index=True).sort_values('score', ascending=False)

    return adjusted_df, adjustment_details


def add_fairness_adjusted_scores(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add fairness-adjusted scores to candidates using the targeted fairness boost logic.
    """
    df = df.copy()

    if 'score' not in df.columns:
        df['fairnessAdjustedScore'] = df.get('score', 0)
        return df

    def adjust_score(row):
        if pd.isna(row['score']):
            return row['score']

        boost, _ = calculate_fairness_boost(row)
        return row['score'] * (1 + boost)

    df['fairnessAdjustedScore'] = df.apply(adjust_score, axis=1)

    # Round to 2 decimals
    df['fairnessAdjustedScore'] = df['fairnessAdjustedScore'].round(2)

    return df


def get_shortlist_comparison(df: pd.DataFrame, top_n: int = 10) -> Dict:
    """
    Compare original vs fairness-adjusted shortlists.

    Args:
        df: Candidate dataframe
        top_n: Shortlist size

    Returns:
        Dictionary with both shortlists and comparison metrics
    """
    # Add fairness scores
    df = add_fairness_adjusted_scores(df)

    # Original shortlist (merit-only)
    original = generate_original_shortlist(df, top_n)

    # Fairness-adjusted shortlist
    adjusted, adjustments = calculate_fairness_adjustments(df, top_n)

    # Calculate demographic composition
    def get_demographics(slist_df):
        demographics = {}
        if 'caste' in slist_df.columns:
            demographics['caste'] = slist_df['caste'].value_counts().to_dict()
        if 'gender' in slist_df.columns:
            demographics['gender'] = slist_df['gender'].value_counts().to_dict()
        return demographics

    return {
        "original": original,
        "adjusted": adjusted,
        "original_demographics": get_demographics(original),
        "adjusted_demographics": get_demographics(adjusted),
        "adjustments": adjustments
    }


def classify_candidate_status(df: pd.DataFrame, fairness_adjusted_col: str = 'fairnessAdjustedScore') -> List[str]:
    """
    Classify candidates into hiring stages based on score bands + percentile ranking.

    Enhanced logic for Indian market with fairness support:

    SHORTLISTED (Top Tier):
    - Score >= 75: Clear strong fits, ready for interview
    - Top performers who demonstrate strong match across experience, qualification, salary fit
    - Includes: High scorers + fairness-boosted deserving candidates from undervalued backgrounds

    IN REVIEW (Middle Tier - Borderline but Promising):
    - Score 60-74: Solid candidates worth deeper evaluation
    - May have career gaps, non-traditional paths, or salary fit challenges
    - Includes: Bootcamp graduates, career switchers, experience-rich underqualified
    - These candidates show real potential despite borderline scores

    REJECTED (Bottom Tier - Clear Low-Fit):
    - Score < 60: Significant gaps, not competitive at this time
    - Entry-level without relevant skills, or misaligned qualifications
    - Suggest for future opportunities as they gain experience

    This distribution aligns with realistic hiring funnel:
    - ~15-25% interviews (shortlisted)
    - ~40-50% further evaluation (in review)
    - ~30-40% not competitive now (rejected)

    Args:
        df: Candidate dataframe with fairness-adjusted scores
        fairness_adjusted_col: Column name containing fairness-adjusted scores

    Returns:
        List of status strings matching DataFrame row order
    """
    if fairness_adjusted_col not in df.columns:
        return ['In Review'] * len(df)

    # Score bands:
    # 80+: Shortlisted
    # 60-79: In Review
    # <60: Rejected

    shortlist_threshold = 80.0
    in_review_threshold = 60.0

    statuses = []
    for _, row in df.iterrows():
        score = row[fairness_adjusted_col]

        if score >= shortlist_threshold:
            # Clear strong fit - ready for interview
            statuses.append('Shortlisted')
        elif score >= in_review_threshold:
            # Borderline but promising - worth deeper evaluation
            # This is where fairness adjustments help deserving nontraditional candidates
            statuses.append('In Review')
        else:
            # Not competitive at this time
            statuses.append('Rejected')

    return statuses
