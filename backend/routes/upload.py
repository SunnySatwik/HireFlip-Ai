from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from models.user import User
from models.dataset import Dataset
from models.schemas import UploadResponse
from services.csv_parser import parse_csv_file, normalize_dataframe, validate_required_columns
from services.fairness_engine import calculate_deterministic_score
import pandas as pd
import io
from pathlib import Path
router = APIRouter()

# In-memory cache for the current session's processed dataframe
# This avoids re-parsing and re-scoring on every request
_dataframe_cache = {}

def apply_deterministic_scoring(df):
    """
    Apply deterministic scoring to candidates.
    """
    if 'score' in df.columns:
        return df

    max_exp = df['experience'].max() if df['experience'].max() > 0 else 1
    max_salary = df['salary_expectation'].max() if 'salary_expectation' in df.columns else 100000
    median_salary = df['salary_expectation'].median() if 'salary_expectation' in df.columns and len(df) > 0 else None

    scores = []
    decision_factors_list = []

    for _, row in df.iterrows():
        score, factors = calculate_deterministic_score(row, max_exp, max_salary, median_salary)
        scores.append(score)
        decision_factors_list.append(factors)

    df['score'] = scores
    df['decisionFactors'] = decision_factors_list

    return df


def load_default_dataset():
    """
    Keep as fallback/init logic if needed, but per-user system is primary.
    """
    default_csv_path = Path(__file__).parent.parent / "sample_data" / "candidates.csv"
    if not default_csv_path.exists():
        return False
    return True


@router.post("/upload-csv", response_model=UploadResponse)
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and save CSV file for the current user.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="File is empty")

        # Validate CSV structure before saving
        df, _ = parse_csv_file(content)
        if not validate_required_columns(df):
            raise HTTPException(
                status_code=400,
                detail="CSV must contain: name, experience, qualification, gender"
            )

        # Save to database
        new_dataset = Dataset(
            user_id=current_user.id,
            filename=file.filename,
            content=content
        )
        db.add(new_dataset)
        db.commit()
        db.refresh(new_dataset)

        # Clear cache for this user
        if current_user.id in _dataframe_cache:
            del _dataframe_cache[current_user.id]

        return UploadResponse(
            success=True,
            rowCount=len(df),
            columns=df.columns.tolist(),
            message=f"Successfully uploaded {file.filename}"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


def get_current_dataset(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> pd.DataFrame:
    """
    Dependency to get the latest processed dataset for the current user.
    """
    # 1. Check in-memory cache first
    if current_user.id in _dataframe_cache:
        return _dataframe_cache[current_user.id]

    # 2. Load latest from DB for this specific user
    dataset = db.query(Dataset).filter(Dataset.user_id == current_user.id).order_by(Dataset.uploaded_at.desc()).first()
    
    # 3. If no dataset, raise 404 to prompt upload on frontend
    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="No dataset found. Please upload a CSV file to begin."
        )

    content = dataset.content

    # 4. Parse and process
    try:
        df, _ = parse_csv_file(content)
        df = normalize_dataframe(df)
        df = apply_deterministic_scoring(df)
        
        # 5. Cache for session
        _dataframe_cache[current_user.id] = df
        return df
    except Exception as e:
        print(f"[ERROR] Dataset corruption for User {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing your dataset.")
