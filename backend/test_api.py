"""
Quick start guide and testing script for the backend API.
Run this to verify the API is working correctly.
"""

import subprocess
import time
import requests
import sys
from pathlib import Path


def start_server():
    """Start the FastAPI server in the background."""
    print("🚀 Starting FastAPI server...")
    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
        cwd=Path(__file__).parent,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(3)  # Wait for server to start
    return process


def test_health():
    """Test the health endpoint."""
    print("\n✅ Testing Health Endpoint")
    try:
        resp = requests.get("http://localhost:8000/health")
        print(f"   Status: {resp.status_code}")
        print(f"   Response: {resp.json()}")
        return resp.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_root():
    """Test the root endpoint."""
    print("\n✅ Testing Root Endpoint")
    try:
        resp = requests.get("http://localhost:8000/")
        print(f"   Status: {resp.status_code}")
        print(f"   Service: {resp.json()['message']}")
        return resp.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_upload():
    """Test CSV upload."""
    print("\n✅ Testing CSV Upload")
    try:
        sample_file = Path(__file__).parent / "sample_data" / "candidates.csv"
        with open(sample_file, "rb") as f:
            files = {"file": f}
            resp = requests.post("http://localhost:8000/upload-csv", files=files)
        print(f"   Status: {resp.status_code}")
        data = resp.json()
        print(f"   Rows Uploaded: {data['rowCount']}")
        print(f"   Columns: {', '.join(data['columns'][:5])}...")
        return resp.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_metrics():
    """Test metrics endpoint."""
    print("\n✅ Testing Metrics Endpoint")
    try:
        resp = requests.get("http://localhost:8000/metrics")
        print(f"   Status: {resp.status_code}")
        data = resp.json()
        print(f"   Fairness Score: {data['fairnessScore']}/100")
        print(f"   Bias Risk Level: {data['biasRiskLevel']}")
        return resp.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_candidates():
    """Test candidates endpoint."""
    print("\n✅ Testing Candidates Endpoint")
    try:
        resp = requests.get("http://localhost:8000/candidates")
        print(f"   Status: {resp.status_code}")
        data = resp.json()
        print(f"   Total Candidates: {data['total']}")
        if data['candidates']:
            print(f"   First Candidate: {data['candidates'][0]['name']}")
        return resp.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_shortlist():
    """Test shortlist endpoint."""
    print("\n✅ Testing Shortlist Endpoint")
    try:
        resp = requests.get("http://localhost:8000/shortlist")
        print(f"   Status: {resp.status_code}")
        data = resp.json()
        print(f"   Original Shortlist: {data['originalCount']} candidates")
        print(f"   Fairness-Adjusted: {data['fairnessAdjustedCount']} candidates")
        return resp.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_report():
    """Test report endpoint."""
    print("\n✅ Testing Report Endpoint")
    try:
        resp = requests.get("http://localhost:8000/report")
        print(f"   Status: {resp.status_code}")
        data = resp.json()
        print(f"   Total Candidates Audited: {data['totalCandidates']}")
        print(f"   Recommendations: {len(data['recommendations'])}")
        print(f"   Risk Level: {data['fairnessMetrics']['biasRiskLevel']}")
        return resp.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("🧪 AI Hiring Fairness Auditor - Backend API Test Suite")
    print("=" * 60)

    server = start_server()

    try:
        tests = [
            test_health,
            test_root,
            test_upload,
            test_metrics,
            test_candidates,
            test_shortlist,
            test_report,
        ]

        results = []
        for test in tests:
            results.append(test())

        print("\n" + "=" * 60)
        print(f"✅ Tests Passed: {sum(results)}/{len(results)}")
        print("=" * 60)

        if all(results):
            print("\n🎉 All tests passed! Backend is working correctly.")
            print("\nNext steps:")
            print("1. Start the frontend: npm run dev (from frontend folder)")
            print("2. Open http://localhost:3000 in your browser")
            print("3. Upload a CSV file to test the full workflow")
        else:
            print("\n⚠️  Some tests failed. Check the errors above.")

    finally:
        print("\n🛑 Shutting down server...")
        server.terminate()
        server.wait()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
        sys.exit(0)
