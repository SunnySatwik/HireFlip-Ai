# AI Hiring Fairness Auditor - Backend API

FastAPI backend for auditing hiring processes for bias and fairness issues.

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

## Running the Application

### Development Mode
```bash
uvicorn main:app --reload
```

Server will run at: `http://localhost:8000`

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

- **Interactive Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)

## API Endpoints

### Data Upload
- **POST** `/upload-csv` - Upload candidate CSV file
  - Accepts: CSV file with columns: name, experience, qualification, gender
  - Returns: Row count and detected columns

### Fairness Metrics
- **GET** `/metrics` - Get fairness audit metrics
  - Returns: fairnessScore, demographicParity, equalizedOdds, biasRiskLevel

### Candidates
- **GET** `/candidates` - Get all processed candidates with fairness scores
  - Returns: List of candidates with scores and fairness adjustments

### Shortlist
- **GET** `/shortlist` - Compare original vs fairness-adjusted shortlist
  - Returns: Top 10 candidates by merit vs top 10 with fairness adjustments

### Reports
- **GET** `/report` - Generate comprehensive audit report
  - Returns: Summary, metrics, and recommendations

### Health
- **GET** `/health` - Health check endpoint
- **GET** `/` - API info and documentation links

## Testing the API

### 1. Upload Sample Data
```bash
curl -X POST "http://localhost:8000/upload-csv" \
  -F "file=@sample_data/candidates.csv"
```

### 2. Get Metrics
```bash
curl "http://localhost:8000/metrics"
```

### 3. Get Candidates
```bash
curl "http://localhost:8000/candidates"
```

### 4. Get Shortlist
```bash
curl "http://localhost:8000/shortlist"
```

### 5. Get Report
```bash
curl "http://localhost:8000/report"
```

## Architecture

### Folder Structure
```
backend/
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Python dependencies
├── models/
│   ├── __init__.py
│   └── schemas.py          # Pydantic models for request/response
├── routes/
│   ├── __init__.py
│   ├── upload.py           # CSV upload endpoint
│   ├── metrics.py          # Fairness metrics endpoint
│   ├── candidates.py       # Candidates list endpoint
│   ├── shortlist.py        # Shortlist comparison endpoint
│   └── reports.py          # Audit report endpoint
├── services/
│   ├── __init__.py
│   ├── csv_parser.py       # CSV parsing and validation
│   ├── fairness_engine.py  # Fairness metrics calculation
│   └── shortlist.py        # Shortlist generation logic
└── sample_data/
    └── candidates.csv      # Sample candidate data
```

## Fairness Metrics

### Demographic Parity
- Measures if selection rates are equal across demographic groups
- Range: 0-1 (1 = perfect parity)
- Compares top 50% selected candidates across gender groups

### Equalized Odds
- Measures if true positive rates (TPR) are equal across groups
- Range: 0-1 (1 = perfect parity)
- Uses experience as proxy for qualified, score as selection decision

### Fairness Score
- Overall score combining both metrics
- Range: 0-100
- Weights: Demographic Parity (40%), Equalized Odds (40%), Representation (20%)

### Bias Risk Level
- **Low**: fairnessScore >= 75 and metrics >= 0.8
- **Medium**: fairnessScore >= 60 and metrics >= 0.6
- **High**: fairnessScore < 60 or metrics < 0.6

## Features

✅ CSV file upload and parsing
✅ Fairness metrics calculation
✅ Demographic bias detection
✅ Fairness-adjusted shortlisting
✅ Comprehensive audit reports
✅ CORS enabled for Next.js frontend
✅ Error handling and validation
✅ In-memory session storage
✅ Production-ready code structure

## CORS Configuration

Frontend is configured to connect from:
- `http://localhost:3000` (Next.js dev server)
- `http://localhost:3001` (alternative port)

To add more origins, edit `main.py` and update the `allow_origins` list in the CORSMiddleware configuration.

## Error Handling

All endpoints include:
- Input validation
- Error responses with descriptive messages
- HTTP status codes (400, 404, 500)
- Exception handling for data processing

## Future Enhancements

- Database integration (PostgreSQL)
- Authentication & authorization
- Multiple file upload support
- Scheduled report generation
- Data export functionality
- Historical audit tracking
- Advanced fairness metrics
- Real-time analytics dashboard
