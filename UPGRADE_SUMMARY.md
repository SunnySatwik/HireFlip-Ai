# HireFlip-Ai Upgrade Summary: Indian Market Refinement

This document summarizes the upgrades made to HireFlip-Ai to align with the realistic Indian hiring pool and fairness auditing requirements.

## 1. Dataset Upgrade (candidates.csv)
- **Pool Size**: Expanded to 50 realistic candidates.
- **Diversity**: Mix of strong (IIT/NIT/IIM), average (Tier-2/3), undervalued (high experience/nontraditional), and weak-fit profiles.
- **Indian Context**:
    - Replaced `ethnicity` with `caste` (General, OBC, SC, ST, EWS).
    - Updated `salary_expectation` to INR **LPA** (Lakhs Per Annum).
    - Varied educational backgrounds including BCA, MCA, B.Tech, and self-taught paths.

## 2. Selection Logic Improvements
- **Deterministic Scoring**: Maintained clear weighted scoring based on experience (50%), qualification (30%), and salary fit (20%).
- **Score Bands**: Strict classification based on score bands:
    - **75+ Shortlisted**: Top tier candidates ready for interview.
    - **60-74 In Review**: Borderline but promising candidates (where fairness boosts are most effective).
    - **<60 Rejected**: Clear low-fit profiles with significant gaps.
- **Confidence Scoring**: Realistic capping at 92% to reflect market uncertainty.

## 3. Fairness System Refinement
- **Caste-Based Fairness**:
    - **SC/ST Boost**: 8% score boost to support historically underrepresented groups.
    - **OBC/EWS Boost**: 5% score boost to ensure socio-economic diversity.
- **Nontraditional Paths**:
    - 7% boost for candidates from bootcamps, self-taught paths, or Tier-3 colleges who demonstrate strong potential.
- **Multi-Group Parity**: Updated fairness metrics (Demographic Parity, Equalized Odds) to handle multiple caste categories simultaneously.
- **Capped Boosts**: Total fairness boost is capped at **15%** to ensure merit-based decisions remain primary.

## 4. UI/UX Updates
- **Explanation Modal**:
    - Now displays **Caste** details.
    - Updated salary display to use **₹** and **LPA** suffix.
- **Detailed Breakdown**: Shows the specific impact of the fairness boost in the decision factors.

## 5. Technical Changes
- Updated `Candidate` Pydantic schema to include the `caste` field.
- Refined `fairness_engine.py` and `shortlist.py` to prioritize `caste` over `ethnicity`.
- Updated `reports.py` to provide caste-specific audit recommendations.
- Ensured all outputs remain deterministic for consistency.

These changes ensure that HireFlip-Ai is now a powerful tool for auditing hiring fairness in the Indian corporate landscape.
