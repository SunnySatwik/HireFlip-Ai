# Analytics Upgrade Summary - HireFlip Backend

## Overview

This document summarizes the upgrade from mock/random analytics to real, deterministic analytics across the HireFlip FastAPI backend. All scoring and fairness calculations are now fully deterministic and based on actual candidate data from the CSV.

**Key Achievement:** Zero randomness - identical CSVs now produce identical results every time.

---

## What Changed

### 1. Deterministic Scoring System ✅

**Before:** 
```python
# Random scoring (non-deterministic)
import numpy as np
experience_score = (experience / max_exp) * 0.7
quality_score = np.random.uniform(0.3, 1.0, len(df)) * 0.3
score = experience_score + quality_score  # Result: varies on every run
```

**After:**
```python
# Deterministic multi-factor scoring (real analytics)
score = (experience_pct * 0.5 + qualification_score * 0.3 + salary_fit * 0.2) * 100
# Result: Always identical for same input
```

**Scoring Factors:**
- **Experience (50%)**: Normalized years of experience relative to max in dataset
- **Qualification (30%)**: Parsed education level (BS→0.5, MS→0.75, MBA→0.8, PhD→1.0)
- **Salary Fit (20%)**: Inverse relationship to salary expectation (lower = better fit)

---

## New Candidate Fields

### 2. Enhanced Candidate Response Schema

Added 4 new optional fields to every candidate in `/candidates` and `/shortlist` endpoints:

#### `status` (string)
- **Values:** `"Shortlisted"`, `"In Review"`, `"Rejected"`
- **Logic:** Based on fairness-adjusted score percentiles
  - **Shortlisted:** Top 50% or top 10 candidates (whichever is larger)
  - **In Review:** 50th-100th percentile by score
  - **Rejected:** Bottom 50% by fairness-adjusted score
- **Purpose:** Shows hiring stage for each candidate

#### `confidence` (float, 0-100)
- **Formula:** `(score/100 * 0.4 + qualification * 0.4 + exp_ratio * 0.2) * 100`
- **Calculation:**
  - Score strength (40%): How well candidate performs overall
  - Qualification match (40%): Education level alignment
  - Experience consistency (20%): Years relative to pool max
- **Purpose:** Indicates overall viability and fit confidence

#### `genderInfluence` (float, percentage)
- **Formula:** `((adjusted_score - original_score) / original_score) * 100`
- **Range:** Typically ±0-5% (capped by fairness boost limit)
- **Interpretation:**
  - Positive: Fairness adjustment boosted this candidate
  - Negative: Would be unusual (fairness boost is additive only)
  - Zero: No fairness adjustment applied
- **Purpose:** Transparency - shows fairness adjustment impact on score

#### `decisionFactors` (object)
- **Contents:**
  ```json
  {
    "experience": 0.667,          // Normalized experience (0-1)
    "qualification": 0.75,        // Parsed qualification level (0-1)
    "salary_fit": 0.172,          // Salary fit score (0-1)
    "fairness_adjustment": 2.5    // Fairness boost percentage
  }
  ```
- **Purpose:** Explainability - shows what factors drove the hiring decision

---

## Example Calculation Walkthrough

**Sample Candidate Data:**
```
id: 5
name: Alice Chen
experience: 8 years
qualification: "MS Computer Science"
gender: Female
salary_expectation: $120,000
```

**Pool Context:**
- Max experience in dataset: 12 years
- Max salary in dataset: $145,000

**Step 1: Calculate Decision Factors**
```
experience_pct = 8 / 12 = 0.667
qualification_score = 0.75 (MS degree)
salary_fit = 1.0 - (120000 / 145000) = 0.172
```

**Step 2: Calculate Deterministic Score**
```
score = (0.667 * 0.5 + 0.75 * 0.3 + 0.172 * 0.2) * 100
      = (0.334 + 0.225 + 0.034) * 100
      = 59.3
```

**Step 3: Apply Fairness Adjustment**
```
If Alice is in underrepresented gender group:
  boost = (global_avg - group_avg) / global_avg * 0.05
  fairnessAdjustedScore = 59.3 * (1 + boost)
  Example with 2.5% boost: 60.8
Else:
  fairnessAdjustedScore = 59.3
```

**Step 4: Calculate Confidence**
```
confidence = (59.3/100 * 0.4 + 0.75 * 0.4 + (8/12) * 0.2) * 100
          = (0.237 + 0.300 + 0.133) * 100
          = 67.0
```

**Step 5: Calculate Gender Influence**
```
genderInfluence = ((60.8 - 59.3) / 59.3) * 100 = 2.5%
```

**Step 6: Classify Status**
```
If score in top 50%: status = "Shortlisted"
Elif score in top 50%-100%: status = "In Review"
Else: status = "Rejected"
```

**Final Output:**
```json
{
  "id": "5",
  "name": "Alice Chen",
  "experience": 8.0,
  "qualification": "MS Computer Science",
  "gender": "Female",
  "salary_expectation": 120000.0,
  "score": 59.3,
  "fairnessAdjustedScore": 60.8,
  "status": "In Review",
  "confidence": 67.0,
  "genderInfluence": 2.5,
  "decisionFactors": {
    "experience": 0.667,
    "qualification": 0.75,
    "salary_fit": 0.172,
    "fairness_adjustment": 2.5
  }
}
```

---

## Files Modified

### 1. **backend/services/fairness_engine.py** (+110 lines)
**Added Functions:**
- `parse_qualification_level(qualification: str) → float`
  - Parses degree from qualification string
  - Returns normalized score: BS→0.5, MS→0.75, MBA→0.8, PhD→1.0

- `calculate_salary_fit(salary, max_salary) → float`
  - Calculates budget alignment (inverse relationship)
  - Formula: `1.0 - (salary / max_salary)` clamped to [0, 1]

- `calculate_deterministic_score(row, max_exp, max_salary) → Tuple[float, Dict]`
  - Main scoring function replacing random scoring
  - Returns (score, decision_factors_dict)

- `calculate_candidate_confidence(score, qualification, experience_ratio) → float`
  - Calculates confidence 0-100 based on 3 factors
  - Formula: `(score/100 * 0.4 + qual * 0.4 + exp_ratio * 0.2) * 100`

- `calculate_gender_influence(original_score, adjusted_score) → float`
  - Calculates fairness adjustment impact percentage
  - Shows transparency in hiring decisions

---

### 2. **backend/models/schemas.py** (+4 fields)
**Enhanced Candidate Model:**
```python
class Candidate(BaseModel):
    # ... existing fields ...
    status: Optional[str] = "In Review"
    confidence: Optional[float] = 50.0
    genderInfluence: Optional[float] = 0.0
    decisionFactors: Optional[Dict[str, float]] = None
```

---

### 3. **backend/routes/upload.py** (+30 lines)
**Changes:**
- Added import: `from services.fairness_engine import calculate_deterministic_score`
- Added `apply_deterministic_scoring(df)` helper function
- Replaced random scoring in `load_default_dataset()`
- Replaced random scoring in `upload_csv()`
- All CSV processing now uses deterministic scoring

---

### 4. **backend/services/shortlist.py** (+35 lines)
**Added Function:**
- `classify_candidate_status(df, fairness_adjusted_col) → List[str]`
  - Assigns "Shortlisted", "In Review", or "Rejected" status
  - Based on fairness-adjusted score percentiles
  - Returns list matching DataFrame row order

---

### 5. **backend/routes/candidates.py** (+40 lines)
**Enhanced GET /candidates endpoint:**
- Added imports for new functions
- Calculate decision factors for each candidate
- Compute confidence scores
- Calculate gender influence percentage
- Classify candidates by status
- Return enriched Candidate objects with all new fields

**Response Structure:**
```json
{
  "total": 20,
  "candidates": [
    {
      "id": "1",
      "name": "John Smith",
      "score": 72.5,
      "status": "Shortlisted",
      "confidence": 78.3,
      "genderInfluence": 0.0,
      "decisionFactors": { ... }
    },
    ...
  ]
}
```

---

### 6. **backend/routes/shortlist.py** (+35 lines)
**Enhanced GET /shortlist endpoint:**
- Added imports for confidence/influence calculation
- Updated `df_to_candidates()` to include decision factors
- Calculate and return all new fields for shortlist candidates
- Both original and fairness-adjusted shortlists now show detailed reasoning

**Response Includes:**
- Original shortlist (merit-only) with decision factors
- Fairness-adjusted shortlist with decision factors
- Side-by-side comparison of demographics
- Adjustment methodology and details

---

## Verification Checklist

### ✅ Determinism Test
- Load sample CSV file
- Call `/candidates` endpoint → Note scores
- Restart server
- Call `/candidates` endpoint again → Verify **identical scores**
- Before: Scores would be random each time
- After: Scores always identical

### ✅ Field Presence Test
Each candidate response should have:
- ✓ `status` (one of: Shortlisted, In Review, Rejected)
- ✓ `confidence` (0-100 float)
- ✓ `genderInfluence` (percentage)
- ✓ `decisionFactors` (object with 4 keys)

### ✅ Score Ranges Test
```python
# All scores should be reasonable ranges
0 <= score <= 100
0 <= confidence <= 100
-5 <= genderInfluence <= 5  # Capped fairness boost
0 <= decisionFactors['*'] <= 1  # Normalized components
```

### ✅ Status Distribution Test
For 20 sample candidates:
- ~10 should be "Shortlisted" (top 50%)
- ~5 should be "In Review"
- ~5 should be "Rejected"

### ✅ Endpoint Test
```bash
# Test all endpoints return new fields
curl http://localhost:8000/candidates | jq '.candidates[0]'
curl http://localhost:8000/shortlist | jq '.original[0]'

# Test metrics remain accurate
curl http://localhost:8000/metrics

# Test CSV upload uses new scoring
curl -F "file=@candidates.csv" http://localhost:8000/upload-csv
curl http://localhost:8000/candidates | jq '.candidates[0].score'
```

---

## No Breaking Changes

✅ **Backward Compatible:**
- CSV upload input format unchanged
- Existing metrics calculations unchanged
- New fields are optional with default values
- All endpoints still respond successfully
- Database schema untouched (in-memory still)
- FastAPI startup behavior unchanged

✅ **Safe to Deploy:**
- No external dependencies added
- No database migrations needed
- Existing API contracts maintained
- Frontend can use new fields optionally

---

## Technical Details

### Scoring Formula Derivation
Originally: `(exp_pct * 0.7) + (random_qual * 0.3)`
- Problem: Non-deterministic, quality component random
- Solution: Use real qualification data, deterministic

New: `(exp_pct * 0.5) + (qual_score * 0.3) + (salary_fit * 0.2)`
- Rationale:
  - Experience: 50% (primary driver)
  - Qualification: 30% (education level/skills)
  - Salary: 20% (budget fit - practical consideration)
- All 100% deterministic and based on actual data

### Qualification Level Mapping
```python
"PhD", "Doctorate"      → 1.0
"MBA"                   → 0.8
"MS", "MA", "Master"    → 0.75
"BS", "BA", "Bachelor"  → 0.5
Default/Unknown         → 0.5
```

### Status Classification Logic
```python
sorted_by_fairness_score = sort_descending(candidates)
shortlist_threshold = sorted[10].score  # Top 10
median_score = median(all_scores)

for candidate in candidates:
    if score >= shortlist_threshold:
        status = "Shortlisted"
    elif score >= median_score:
        status = "In Review"
    else:
        status = "Rejected"
```

---

## Performance Impact

✅ **No Significant Performance Changes:**
- Added O(n) calculation per CSV processing (acceptably fast)
- Scoring functions have O(1) complexity
- DataFrame operations use pandas vectorization where possible
- Memory usage unchanged (in-memory storage only)

---

## Future Enhancement Opportunities

1. **Weighted Qualification:** Different degrees by role
2. **Multi-Demographic:** Analyze gender X ethnicity intersections
3. **Statistical Tests:** Significance testing on fairness metrics
4. **Alternative Scoring:** Multiple scoring strategies available
5. **Historical Tracking:** Store decision factors for audit trail
6. **Real-Time Updates:** Dynamic confidence/status recalculation

---

## Summary Statistics

| Metric | Before | After |
|--------|--------|-------|
| Score Determinism | Random (varies) | Deterministic ✓ |
| Candidate Fields | 8 | 12 |
| Scoring Factors | 2 (exp + random) | 3 (exp + qual + salary) |
| Decision Transparency | Low | High |
| Configuration | Hard-coded | Same (no change needed) |
| Database Required | No | No |
| API Compatibility | N/A | Maintained ✓ |

---

## Deployment Steps

1. **Backup current data** (if any uploaded datasets in memory)
2. **Deploy updated code** (all 6 files)
3. **Restart FastAPI server** - defaults will load
4. **Test determinism** - verify same CSV produces identical scores
5. **Verify new fields** - check `/candidates` and `/shortlist` responses
6. **Monitor startup** - confirm default dataset loads successfully
7. **Optional: Upload test CSV** - validate with real data

---

## Support & Troubleshooting

### Issue: Scores Different from Before
**Expected:** Score generation algorithm completely changed
- Old: 70% experience + 30% random
- New: 50% experience + 30% qualification + 20% salary
- Resolution: This is intentional - new scoring is more realistic

### Issue: Status All "In Review"
**Check:**
- DataFrame has fairnessAdjustedScore column
- fairnessAdjustedScore values not all identical
- Resolution: Run `/metrics` to verify data loaded

### Issue: Confidence Out of Range
**Should be:** 0-100
- Resolution: Check calculation - formula should produce this range

### Issue: CSV Upload Fails
**Check:**
- CSV has required columns: name, experience, qualification, gender
- No issues in server logs
- Resolution: Ensure CSV format matches sample_data/candidates.csv

---

## Questions?

Review:
1. Scoring formula in `calculate_deterministic_score()` function
2. Status classification in `classify_candidate_status()` function
3. Example calculation walkthrough above
4. Test endpoints manually to verify behavior

All calculations are deterministic and reproducible.

---

**Date:** 2026-04-27
**Version:** 1.0 - Analytics Upgrade
**Status:** Ready for Deployment ✅
