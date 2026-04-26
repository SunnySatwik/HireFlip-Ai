# Backend Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server
```bash
uvicorn main:app --reload
```

Server runs at: **http://localhost:8000**

### 3. Test the API
```bash
# In another terminal
python test_api.py
```

## Detailed Setup

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Step-by-Step Installation

#### 1. Navigate to Backend Directory
```bash
cd backend
```

#### 2. Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

This installs:
- **FastAPI** (0.104.1) - Web framework
- **Uvicorn** (0.24.0) - ASGI server
- **Pandas** (2.1.3) - Data processing
- **Pydantic** (2.5.0) - Data validation
- **python-multipart** (0.0.6) - File uploads
- **python-dotenv** (1.0.0) - Environment variables

#### 4. Verify Installation
```bash
python -c "import fastapi; print(f'FastAPI {fastapi.__version__}')"
```

### Running the Server

#### Development Mode (with auto-reload)
```bash
uvicorn main:app --reload
```

Server output will show:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

#### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Usage

### Interactive Documentation
Once server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Example Workflow

#### 1. Upload CSV
```bash
curl -X POST "http://localhost:8000/upload-csv" \
  -H "accept: application/json" \
  -F "file=@sample_data/candidates.csv"
```

Expected response:
```json
{
  "success": true,
  "rowCount": 20,
  "columns": ["id", "name", "experience", "qualification", "gender", "ethnicity", "salary_expectation"],
  "message": "Successfully uploaded 20 candidates"
}
```

#### 2. Get Fairness Metrics
```bash
curl "http://localhost:8000/metrics"
```

Expected response:
```json
{
  "fairnessScore": 72.5,
  "demographicParity": 0.85,
  "equalizedOdds": 0.78,
  "biasRiskLevel": "Medium",
  "lastUpdated": "2024-04-26T14:30:00"
}
```

#### 3. Get Candidates
```bash
curl "http://localhost:8000/candidates"
```

#### 4. Get Shortlist Comparison
```bash
curl "http://localhost:8000/shortlist"
```

#### 5. Generate Audit Report
```bash
curl "http://localhost:8000/report"
```

## Connecting Frontend

### Frontend Configuration

Your Next.js frontend should be configured to call the backend at:
```
http://localhost:8000
```

Example API call from frontend:
```javascript
async function uploadCandidates(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8000/upload-csv', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}
```

### CORS Enabled
The backend is already configured for CORS with:
- ✅ `http://localhost:3000` (Next.js default)
- ✅ `http://localhost:3001` (alternative port)

To add more origins, edit `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://your-domain.com"],
    # ...
)
```

## Troubleshooting

### Port Already in Use
If port 8000 is already in use:
```bash
# Use a different port
uvicorn main:app --reload --port 8001
```

### Import Errors
If you get import errors:
```bash
# Ensure you're in the backend directory
cd backend

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### CORS Issues
If frontend can't reach backend:
1. Verify backend is running: `http://localhost:8000/health`
2. Check CORS origins in `main.py`
3. Verify frontend is on correct port (3000)

### Module Not Found Errors
Ensure these files exist:
```
backend/
├── main.py
├── models/__init__.py
├── routes/__init__.py
└── services/__init__.py
```

## File Structure Reference

```
backend/
├── main.py                    # Main app entry point
├── requirements.txt           # Dependencies
├── test_api.py               # Test script
├── README.md                 # API documentation
├── SETUP.md                  # This file
├── models/
│   ├── __init__.py
│   └── schemas.py            # Pydantic schemas
├── routes/
│   ├── __init__.py
│   ├── upload.py             # POST /upload-csv
│   ├── metrics.py            # GET /metrics
│   ├── candidates.py         # GET /candidates
│   ├── shortlist.py          # GET /shortlist
│   └── reports.py            # GET /report
├── services/
│   ├── __init__.py
│   ├── csv_parser.py         # CSV parsing
│   ├── fairness_engine.py    # Fairness calculations
│   └── shortlist.py          # Shortlist logic
└── sample_data/
    └── candidates.csv        # Sample data
```

## Running Both Frontend and Backend

### Terminal 1 (Backend)
```bash
cd backend
uvicorn main:app --reload
```

### Terminal 2 (Frontend)
```bash
cd frontend
npm run dev
```

Then open: **http://localhost:3000**

## Environment Variables (Optional)

Create a `.env` file in the backend folder:
```
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:3000
DEBUG=true
```

Load in `main.py`:
```python
from dotenv import load_dotenv
import os

load_dotenv()
port = int(os.getenv("BACKEND_PORT", 8000))
```

## Next Steps

1. ✅ Run backend: `uvicorn main:app --reload`
2. ✅ Test API: `python test_api.py`
3. ✅ Start frontend: `npm run dev`
4. ✅ Open http://localhost:3000
5. ✅ Upload CSV file and audit hiring fairness!

## Support

For issues or questions:
1. Check API docs: http://localhost:8000/docs
2. Review sample data: `sample_data/candidates.csv`
3. Check error messages in server logs
4. Verify all dependencies are installed: `pip list`

Happy hiring! 🚀
