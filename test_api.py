"""
Test script for the LSTM prediction API.

This script demonstrates how to use the backend API endpoints.
"""
import requests
import json
import numpy as np

# API base URL
BASE_URL = "http://localhost:5000"

def test_health():
    """Test the health check endpoint."""
    print("\n" + "="*50)
    print("Testing Health Check Endpoint")
    print("="*50)
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_predict():
    """Test the prediction endpoint."""
    print("\n" + "="*50)
    print("Testing Prediction Endpoint")
    print("="*50)
    
    # Generate sample data (100 values for LSTM sequence)
    sample_data = np.random.randn(100).tolist()
    
    payload = {
        "data": sample_data
    }
    
    print(f"Sending {len(sample_data)} input values...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/predict",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_invalid_request():
    """Test invalid request handling."""
    print("\n" + "="*50)
    print("Testing Invalid Request")
    print("="*50)
    
    # Missing 'data' field
    payload = {"invalid": "field"}
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/predict",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 400
    except Exception as e:
        print(f"Error: {e}")
        return False


if __name__ == "__main__":
    print("\n🚀 LSTM Backend API Test Suite")
    print("Make sure the backend is running: python main.py\n")
    
    results = {
        "health_check": test_health(),
        "predict": test_predict(),
        "invalid_request": test_invalid_request()
    }
    
    print("\n" + "="*50)
    print("Test Summary")
    print("="*50)
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    if all_passed:
        print("\n✓ All tests passed!")
    else:
        print("\n✗ Some tests failed.")
