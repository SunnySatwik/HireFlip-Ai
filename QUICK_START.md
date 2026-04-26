# Quick Reference - Backend API Commands

## 🚀 Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Server URL:** http://localhost:8000

## 📚 Access Documentation

- **Swagger UI (Try it out):** http://localhost:8000/docs
- **ReDoc (Read-only):** http://localhost:8000/redoc
- **API Info:** http://localhost:8000/

## 🧪 Test the API

### Option 1: Automated Tests
```bash
python test_api.py
```

### Option 2: Manual cURL Commands

**Upload CSV:**
```bash
curl -X POST "http://localhost:8000/upload-csv" \
  -F "file=@sample_data/candidates.csv"
```

**Get Fairness Metrics:**
```bash
curl "http://localhost:8000/metrics"
```

**Get All Candidates:**
```bash
curl "http://localhost:8000/candidates"
```

**Get Shortlist Comparison:**
```bash
curl "http://localhost:8000/shortlist"
```

**Get Audit Report:**
```bash
curl "http://localhost:8000/report"
```

**Health Check:**
```bash
curl "http://localhost:8000/health"
```

## 📱 Connect Frontend

### In your Next.js frontend (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Example API call:
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function uploadCandidates(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_URL}/upload-csv`, {
    method: 'POST',
    body: formData
  });
  return response.json();
}
```

## 📊 API Endpoints Summary

| Endpoint | Method | Purpose | Returns |
|----------|--------|---------|---------|
| `/upload-csv` | POST | Upload CSV | Row count, columns |
| `/metrics` | GET | Fairness metrics | Scores, risk level |
| `/candidates` | GET | All candidates | List with scores |
| `/shortlist` | GET | Compare shortlists | Original vs adjusted |
| `/report` | GET | Audit report | Summary & recommendations |
| `/health` | GET | Status check | `{status: "healthy"}` |
| `/` | GET | API info | Endpoints & docs links |

## 🔧 Configuration

Edit `config.py` to customize:
- `FRONTEND_URL` - Frontend origin for CORS
- `SHORTLIST_SIZE` - Number of candidates to shortlist (default: 10)
- `ALLOWED_ORIGINS` - Allowed CORS origins
- Risk level thresholds

## 📝 File Descriptions

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app + route registration |
| `config.py` | Configuration constants |
| `requirements.txt` | Python dependencies |
| `test_api.py` | Automated test suite |
| `models/schemas.py` | Pydantic request/response models |
| `routes/*.py` | API endpoints (5 routers) |
| `services/*.py` | Business logic (3 services) |
| `sample_data/candidates.csv` | 20 sample records for testing |

## 🐛 Troubleshooting

**Port 8000 already in use?**
```bash
uvicorn main:app --reload --port 8001
```

**Import errors?**
```bash
pip install -r requirements.txt --force-reinstall
```

**CORS errors from frontend?**
1. Verify backend is running: http://localhost:8000/health
2. Verify frontend is on port 3000
3. Check `config.py` CORS configuration

**CSV upload fails?**
- File must be `.csv` format
- Must have columns: name, experience, qualification, gender
- File size must be < 10 MB

## 📖 Full Documentation

- **SETUP.md** - Detailed setup and installation
- **README.md** - Complete API documentation
- **FRONTEND_INTEGRATION.md** - React component examples
- **BACKEND_SUMMARY.md** - Complete project overview

## 🎯 Sample Workflow

1. **Start backend**
   ```bash
   uvicorn main:app --reload
   ```

2. **Upload data**
   ```bash
   curl -X POST "http://localhost:8000/upload-csv" \
     -F "file=@sample_data/candidates.csv"
   ```

3. **Check metrics**
   ```bash
   curl "http://localhost:8000/metrics"
   ```

4. **Review shortlist**
   ```bash
   curl "http://localhost:8000/shortlist"
   ```

5. **Get report**
   ```bash
   curl "http://localhost:8000/report"
   ```

## 📦 What's Included

✅ Production-ready FastAPI backend
✅ 5 API endpoints with full documentation
✅ 3 service modules for business logic
✅ Pydantic schemas for validation
✅ CORS configured for Next.js
✅ Fairness metrics calculation
✅ Shortlist comparison logic
✅ Comprehensive error handling
✅ Sample data (20 candidates)
✅ Automated test suite
✅ Complete documentation
✅ Integration examples

## ✨ Ready to Go!

Your backend is production-ready. Just install dependencies, run the server, and connect your frontend!

For questions, check the documentation files or visit http://localhost:8000/docs
