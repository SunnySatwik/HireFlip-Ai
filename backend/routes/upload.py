"""
CSV upload endpoint for candidate data.
"""

import os
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException
from models.schemas import UploadResponse
from services.csv_parser import parse_csv_file, normalize_dataframe, validate_required_columns
from services.fairness_engine import calculate_deterministic_score

router = APIRouter()

# In-memory storage for current session
current_dataset = {
    "df": None,
    "columns": [],
    "row_count": 0,
    "source": None  # Track whether data came from default or upload
}


def apply_deterministic_scoring(df):
    """
    Apply deterministic scoring to candidates.

    Replaces random scoring with real multi-factor scoring based on:
    - Experience (50% weight)
    - Qualification level (30% weight)
    - Salary fit (20% weight)
    """
    if 'score' in df.columns:
        return df  # Use existing scores if present

    max_exp = df['experience'].max() if df['experience'].max() > 0 else 1
    max_salary = df['salary_expectation'].max() if 'salary_expectation' in df.columns else 100000

    scores = []
    decision_factors_list = []

    for _, row in df.iterrows():
        score, factors = calculate_deterministic_score(row, max_exp, max_salary)
        scores.append(score)
        decision_factors_list.append(factors)

    df['score'] = scores
    df['decisionFactors'] = decision_factors_list

    return df


def load_default_dataset():
    """
    Load default dataset from sample_data/candidates.csv on startup.

    Called by FastAPI startup event to initialize dashboard with sample data.
    If CSV is missing, silently logs but doesn't crash.
    """
    default_csv_path = Path(__file__).parent.parent / "sample_data" / "candidates.csv"

    try:
        if not default_csv_path.exists():
            print(f"⚠️  Default CSV not found at {default_csv_path}")
            return False

        # Read the CSV file
        with open(default_csv_path, 'rb') as f:
            content = f.read()

        if len(content) == 0:
            print(f"⚠️  Default CSV is empty at {default_csv_path}")
            return False

        # Parse CSV
        df, columns = parse_csv_file(content)

        # Validate required columns
        if not validate_required_columns(df):
            print("⚠️  Default CSV missing required columns: name, experience, qualification, gender")
            return False

        # Normalize data
        df = normalize_dataframe(df)

        # Apply deterministic scoring
        df = apply_deterministic_scoring(df)

        # Store in memory
        current_dataset["df"] = df
        current_dataset["columns"] = df.columns.tolist()
        current_dataset["row_count"] = len(df)
        current_dataset["source"] = "default"

        print(f"✅ Default dataset loaded: {len(df)} candidates from {default_csv_path.name}")
        return True

    except Exception as e:
        print(f"⚠️  Error loading default dataset: {str(e)}")
        return False


@router.post("/upload-csv", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload and parse CSV file containing candidate data.

    Expected columns: name, experience, qualification, gender (and optional others)

    Args:
        file: CSV file upload

    Returns:
        UploadResponse with row count and detected columns
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    try:
        # Read file content
        content = await file.read()

        if len(content) == 0:
            raise HTTPException(status_code=400, detail="File is empty")

        # Parse CSV
        df, columns = parse_csv_file(content)

        # Validate required columns
        if not validate_required_columns(df):
            raise HTTPException(
                status_code=400,
                detail="CSV must contain: name, experience, qualification, gender"
            )

        # Normalize data
        df = normalize_dataframe(df)

        # Apply deterministic scoring
        df = apply_deterministic_scoring(df)

        # Store in memory
        current_dataset["df"] = df
        current_dataset["columns"] = df.columns.tolist()
        current_dataset["row_count"] = len(df)
        current_dataset["source"] = "upload"

        return UploadResponse(
            success=True,
            rowCount=len(df),
            columns=df.columns.tolist(),
            message=f"Successfully uploaded {len(df)} candidates"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


def get_current_dataset():
    """Get the currently loaded dataset."""
    if current_dataset["df"] is None:
        raise HTTPException(
            status_code=400,
            detail="No dataset loaded. Default dataset failed to load on startup. Please upload a CSV file to proceed."
        )
    return current_dataset["df"]
