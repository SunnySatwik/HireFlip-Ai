# Frontend Integration Guide

This guide shows how to integrate your Next.js frontend with the FastAPI backend API.

## API Base URL

Set your API base URL in your frontend environment or config:

```javascript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then use it in your API calls:

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

## API Service Module

Create a reusable API service module:

```javascript
// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiService = {
  async uploadCSV(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/upload-csv`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },

  async getMetrics() {
    const response = await fetch(`${API_URL}/metrics`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  },

  async getCandidates() {
    const response = await fetch(`${API_URL}/candidates`);
    if (!response.ok) throw new Error('Failed to fetch candidates');
    return response.json();
  },

  async getShortlist() {
    const response = await fetch(`${API_URL}/shortlist`);
    if (!response.ok) throw new Error('Failed to fetch shortlist');
    return response.json();
  },

  async getReport() {
    const response = await fetch(`${API_URL}/report`);
    if (!response.ok) throw new Error('Failed to fetch report');
    return response.json();
  },

  async healthCheck() {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};
```

## React Hook for API Calls

```javascript
// hooks/useBackendAPI.js
import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api';

export function useBackendAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUploadCSV = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.uploadCSV(file);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await apiService.getMetrics();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await apiService.getCandidates();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetShortlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await apiService.getShortlist();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await apiService.getReport();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    uploadCSV: handleUploadCSV,
    getMetrics: handleGetMetrics,
    getCandidates: handleGetCandidates,
    getShortlist: handleGetShortlist,
    getReport: handleGetReport,
  };
}
```

## Component Example: CSV Upload

```javascript
// components/UploadForm.jsx
import { useState } from 'react';
import { useBackendAPI } from '@/hooks/useBackendAPI';

export function UploadForm({ onSuccess }) {
  const [file, setFile] = useState(null);
  const { loading, error, uploadCSV } = useBackendAPI();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      const result = await uploadCSV(file);
      console.log('Upload successful:', result);
      onSuccess?.(result);
      setFile(null);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={loading}
        />
      </div>
      
      {error && <p className="text-red-600">{error}</p>}
      
      <button
        type="submit"
        disabled={!file || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Uploading...' : 'Upload CSV'}
      </button>
    </form>
  );
}
```

## Component Example: Metrics Display

```javascript
// components/FairnessMetrics.jsx
import { useEffect, useState } from 'react';
import { useBackendAPI } from '@/hooks/useBackendAPI';

export function FairnessMetrics() {
  const [metrics, setMetrics] = useState(null);
  const { loading, error, getMetrics } = useBackendAPI();

  useEffect(() => {
    getMetrics()
      .then(setMetrics)
      .catch(console.error);
  }, [getMetrics]);

  if (loading) return <p>Loading metrics...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!metrics) return <p>No metrics available</p>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-white border rounded">
        <h3 className="font-bold">Fairness Score</h3>
        <p className="text-2xl">{metrics.fairnessScore}/100</p>
      </div>

      <div className="p-4 bg-white border rounded">
        <h3 className="font-bold">Bias Risk</h3>
        <p className={`text-2xl ${
          metrics.biasRiskLevel === 'Low' ? 'text-green-600' :
          metrics.biasRiskLevel === 'Medium' ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {metrics.biasRiskLevel}
        </p>
      </div>

      <div className="p-4 bg-white border rounded">
        <h3 className="font-bold">Demographic Parity</h3>
        <p className="text-2xl">{(metrics.demographicParity * 100).toFixed(1)}%</p>
      </div>

      <div className="p-4 bg-white border rounded">
        <h3 className="font-bold">Equalized Odds</h3>
        <p className="text-2xl">{(metrics.equalizedOdds * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
}
```

## Component Example: Candidates List

```javascript
// components/CandidatesList.jsx
import { useEffect, useState } from 'react';
import { useBackendAPI } from '@/hooks/useBackendAPI';

export function CandidatesList() {
  const [candidates, setCandidates] = useState(null);
  const { loading, error, getCandidates } = useBackendAPI();

  useEffect(() => {
    getCandidates()
      .then((data) => setCandidates(data.candidates))
      .catch(console.error);
  }, [getCandidates]);

  if (loading) return <p>Loading candidates...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!candidates) return <p>No candidates loaded</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Experience</th>
            <th className="border p-2 text-left">Gender</th>
            <th className="border p-2 text-right">Score</th>
            <th className="border p-2 text-right">Adjusted</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate.id} className="hover:bg-gray-50">
              <td className="border p-2">{candidate.name}</td>
              <td className="border p-2">{candidate.experience} yrs</td>
              <td className="border p-2">{candidate.gender}</td>
              <td className="border p-2 text-right">{candidate.score.toFixed(2)}</td>
              <td className="border p-2 text-right">{candidate.fairnessAdjustedScore.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Component Example: Shortlist Comparison

```javascript
// components/ShortlistComparison.jsx
import { useEffect, useState } from 'react';
import { useBackendAPI } from '@/hooks/useBackendAPI';

export function ShortlistComparison() {
  const [shortlist, setShortlist] = useState(null);
  const { loading, error, getShortlist } = useBackendAPI();

  useEffect(() => {
    getShortlist()
      .then(setShortlist)
      .catch(console.error);
  }, [getShortlist]);

  if (loading) return <p>Loading shortlist...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!shortlist) return <p>No shortlist available</p>;

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h3 className="font-bold text-lg mb-4">Original Shortlist ({shortlist.originalCount})</h3>
        <ul className="space-y-2">
          {shortlist.original.map((candidate) => (
            <li key={candidate.id} className="p-2 bg-gray-100 rounded">
              {candidate.name} ({candidate.score.toFixed(2)})
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-4">Fairness-Adjusted ({shortlist.fairnessAdjustedCount})</h3>
        <ul className="space-y-2">
          {shortlist.fairnessAdjusted.map((candidate) => (
            <li key={candidate.id} className="p-2 bg-green-100 rounded">
              {candidate.name} ({candidate.fairnessAdjustedScore.toFixed(2)})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## Dashboard Integration Example

```javascript
// pages/dashboard.jsx
import { useState } from 'react';
import { UploadForm } from '@/components/UploadForm';
import { FairnessMetrics } from '@/components/FairnessMetrics';
import { CandidatesList } from '@/components/CandidatesList';
import { ShortlistComparison } from '@/components/ShortlistComparison';

export default function Dashboard() {
  const [dataLoaded, setDataLoaded] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">AI Hiring Fairness Auditor</h1>

      {!dataLoaded ? (
        <div className="p-8 bg-gray-50 rounded">
          <h2 className="text-2xl font-bold mb-4">Upload Candidate Data</h2>
          <UploadForm 
            onSuccess={(result) => {
              console.log('Data loaded:', result);
              setDataLoaded(true);
            }}
          />
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Fairness Metrics</h2>
            <FairnessMetrics />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Shortlist Comparison</h2>
            <ShortlistComparison />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">All Candidates</h2>
            <CandidatesList />
          </section>

          <button
            onClick={() => setDataLoaded(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Upload New Data
          </button>
        </div>
      )}
    </div>
  );
}
```

## Error Handling

Implement proper error handling in your frontend:

```javascript
// utils/errorHandler.js
export const handleAPIError = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.status === 400) {
    return error.response.data?.detail || 'Invalid request';
  }
  if (error.response?.status === 500) {
    return 'Server error. Please try again.';
  }
  return defaultMessage;
};
```

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Ensure backend is running on port 8000
2. Check that frontend is on port 3000
3. Verify CORS configuration in `backend/main.py`

### 404 Errors
If you get 404 errors:
1. Make sure the backend server is running
2. Check the API URL is correct: `http://localhost:8000`
3. Verify the endpoint path matches (e.g., `/metrics` not `/get-metrics`)

### File Upload Errors
If CSV upload fails:
1. Ensure file is valid CSV format
2. Check file size is under 10 MB
3. Verify CSV has required columns: name, experience, qualification, gender

## Testing the Integration

```bash
# Terminal 1: Start backend
cd backend
uvicorn main:app --reload

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Optional - Run backend tests
cd backend
python test_api.py
```

Then open http://localhost:3000 in your browser!

## Production Deployment

For production, update your API URL:

```javascript
// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.origin);

// Or use environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

In `.env.production`:
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

Then deploy both frontend and backend to your hosting platform.
