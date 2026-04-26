"""
CSV upload endpoint for candidate data.
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from models.schemas import UploadResponse
from services.csv_parser import parse_csv_file, normalize_dataframe, validate_required_columns

router = APIRouter()

# In-memory storage for current session
current_dataset = {
    "df": None,
    "columns": [],
    "row_count": 0
}


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

        # Generate scores if not present
        if 'score' not in df.columns:
            # Simple scoring: (experience / max_experience) * 0.7 + (random quality) * 0.3
            import numpy as np
            max_exp = df['experience'].max() if df['experience'].max() > 0 else 1
            experience_score = (df['experience'] / max_exp) * 0.7
            quality_score = np.random.uniform(0.3, 1.0, len(df)) * 0.3
            df['score'] = (experience_score + quality_score).round(2)

        # Store in memory
        current_dataset["df"] = df
        current_dataset["columns"] = df.columns.tolist()
        current_dataset["row_count"] = len(df)

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
        raise HTTPException(status_code=400, detail="No dataset loaded. Please upload a CSV first.")
    return current_dataset["df"]
