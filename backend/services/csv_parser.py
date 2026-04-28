"""
CSV parsing and data loading service.
"""

import pandas as pd
import io
from typing import Tuple, List


def parse_csv_file(file_content: bytes) -> Tuple[pd.DataFrame, List[str]]:
    """
    Parse CSV file content into a pandas DataFrame.

    Args:
        file_content: Raw bytes from uploaded CSV file

    Returns:
        Tuple of (DataFrame, list of column names)

    Raises:
        ValueError: If CSV is invalid or empty
    """
    try:
        # Read CSV from bytes
        df = pd.read_csv(io.BytesIO(file_content))

        if df.empty:
            raise ValueError("CSV file is empty")

        # Clean column names (strip whitespace, lowercase)
        df.columns = df.columns.str.strip().str.lower()

        # Remove empty rows
        df = df.dropna(how='all')

        return df, df.columns.tolist()

    except pd.errors.ParserError as e:
        raise ValueError(f"Invalid CSV format: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error parsing CSV: {str(e)}")


def validate_required_columns(df: pd.DataFrame) -> bool:
    """
    Validate that CSV contains essential candidate columns.

    Expected columns: name, experience, qualification, gender
    """
    required_cols = {'name', 'experience', 'qualification', 'gender'}
    available_cols = set(df.columns.str.lower())

    return required_cols.issubset(available_cols)


def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize and clean the DataFrame.

    - Convert numeric columns
    - Standardize text columns
    - Add default ID if missing
    """
    df = df.copy()

    # Add ID column if missing
    if 'id' not in df.columns:
        df.insert(0, 'id', range(1, len(df) + 1))

    # Convert experience to numeric (handle errors)
    if 'experience' in df.columns:
        df['experience'] = pd.to_numeric(df['experience'], errors='coerce').fillna(0)

    # Standardize text columns
    text_columns = ['name', 'qualification', 'gender', 'ethnicity', 'caste']
    for col in text_columns:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    return df
