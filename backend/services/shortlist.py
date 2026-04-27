"""
Shortlist generation and fairness adjustment service.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple


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

    Args:
        df: Candidate dataframe
        top_n: Number of candidates to shortlist

    Returns:
        Tuple of (adjusted shortlist DataFrame, adjustment details)
    """
    if 'gender' not in df.columns or 'score' not in df.columns:
        return generate_original_shortlist(df, top_n), {"method": "no_demographics"}

    df = df.copy()

    # Calculate demographic proportions
    gender_proportions = df['gender'].value_counts(normalize=True).to_dict()

    # Calculate target count per gender
    targets = {}
    remaining = top_n
    for gender, prop in sorted(gender_proportions.items(), key=lambda x: -x[1]):
        target = max(1, round(prop * top_n))  # At least 1 per group
        target = min(target, remaining)
        targets[gender] = target
        remaining -= target

    # Select top candidates per gender
    selected_candidates = []
    adjustment_details = {
        "method": "proportional_representation",
        "gender_targets": targets,
        "adjustments_made": []
    }

    for gender, target in targets.items():
        gender_candidates = df[df['gender'] == gender].nlargest(target, 'score')
        selected_candidates.append(gender_candidates)

        # Track if we had to include lower-scoring candidates
        if len(gender_candidates) > 0:
            min_score = gender_candidates['score'].min()
            original_threshold = df['score'].nlargest(top_n).min()
            if min_score < original_threshold:
                adjustment_details["adjustments_made"].append({
                    "gender": gender,
                    "count": len(gender_candidates),
                    "min_score_included": round(float(min_score), 2),
                    "original_threshold": round(float(original_threshold), 2)
                })

    # Combine and sort by score
    adjusted_df = pd.concat(selected_candidates, ignore_index=True).sort_values('score', ascending=False)

    return adjusted_df, adjustment_details


def add_fairness_adjusted_scores(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add fairness-adjusted scores to candidates.

    Adjustment: Boost scores for underrepresented groups slightly to ensure
    diverse representation while maintaining merit-based decisions.

    Args:
        df: Candidate dataframe with 'score' column

    Returns:
        DataFrame with added 'fairnessAdjustedScore' column
    """
    df = df.copy()

    if 'score' not in df.columns:
        df['fairnessAdjustedScore'] = df.get('score', 0)
        return df

    # Calculate baseline metrics
    if 'gender' in df.columns:
        gender_avg_score = df.groupby('gender')['score'].mean()
        global_avg = df['score'].mean()

        # Calculate adjustment factor per gender
        def adjust_score(row):
            if pd.isna(row['score']):
                return row['score']

            gender = row['gender']
            if gender in gender_avg_score.index:
                group_avg = gender_avg_score[gender]
                # Boost underrepresented groups slightly (5% max)
                if group_avg < global_avg:
                    boost = (global_avg - group_avg) / global_avg * 0.05
                    return row['score'] * (1 + boost)

            return row['score']

        df['fairnessAdjustedScore'] = df.apply(adjust_score, axis=1)
    else:
        df['fairnessAdjustedScore'] = df['score']

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
        if 'gender' in slist_df.columns:
            return slist_df['gender'].value_counts().to_dict()
        return {}

    return {
        "original": original,
        "adjusted": adjusted,
        "original_demographics": get_demographics(original),
        "adjusted_demographics": get_demographics(adjusted),
        "adjustments": adjustments
    }


def classify_candidate_status(df: pd.DataFrame, fairness_adjusted_col: str = 'fairnessAdjustedScore') -> List[str]:
    """
    Classify candidates as Shortlisted, In Review, or Rejected based on fairness-adjusted scores.

    Classification Logic:
    - Shortlisted: Top candidates (50th percentile and above, or top 10 if < 20 total)
    - In Review: Next tier (bottom 50th percentile but above rejected threshold)
    - Rejected: Bottom candidates (below 50th percentile)

    Args:
        df: Candidate dataframe with fairness-adjusted scores
        fairness_adjusted_col: Column name containing fairness-adjusted scores

    Returns:
        List of status strings matching DataFrame row order
    """
    if fairness_adjusted_col not in df.columns:
        return ['In Review'] * len(df)

    df_sorted = df.sort_values(fairness_adjusted_col, ascending=False).copy()

    # Determine shortlist size
    shortlist_size = min(10, max(1, len(df) // 2))

    # Get threshold score for shortlist
    if shortlist_size < len(df):
        shortlist_threshold = df_sorted[fairness_adjusted_col].iloc[shortlist_size - 1]
    else:
        shortlist_threshold = df_sorted[fairness_adjusted_col].min()

    # Calculate 50th percentile
    median_score = df[fairness_adjusted_col].median()

    # Assign statuses
    statuses = []
    for _, row in df.iterrows():
        score = row[fairness_adjusted_col]
        if score >= shortlist_threshold:
            statuses.append('Shortlisted')
        elif score >= median_score:
            statuses.append('In Review')
        else:
            statuses.append('Rejected')

    return statuses
