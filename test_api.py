import requests
import sys
from pathlib import Path

# Configuration
API_URL = "http://localhost:8000"

def test_health():
    """Test health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{API_URL}/health")
        print(f"✓ Health check: {response.json()}")
        return True
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False

def test_classes():
    """Test classes endpoint"""
    print("\nGetting supported classes...")
    try:
        response = requests.get(f"{API_URL}/classes")
        classes = response.json()
        print(f"✓ Supported classes: {classes['classes']}")
        return True
    except Exception as e:
        print(f"✗ Failed to get classes: {e}")
        return False

def test_single_prediction(image_path):
    """Test single image prediction"""
    print(f"\nTesting single prediction with: {image_path}")
    
    if not Path(image_path).exists():
        print(f"✗ Image file not found: {image_path}")
        return False
    
    try:
        with open(image_path, "rb") as f:
            files = {"file": f}
            response = requests.post(f"{API_URL}/predict", files=files)
        
        result = response.json()
        print(f"✓ Prediction result:")
        print(f"  - Filename: {result['filename']}")
        print(f"  - Predicted class: {result['predicted_class']}")
        print(f"  - Confidence: {result['confidence']:.2%}")
        print(f"  - All predictions:")
        for class_name, prob in result['all_predictions'].items():
            print(f"      {class_name}: {prob:.2%}")
        return True
    except Exception as e:
        print(f"✗ Prediction failed: {e}")
        return False

def test_batch_prediction(image_paths):
    """Test batch image prediction"""
    print(f"\nTesting batch prediction with {len(image_paths)} images...")
    
    files = []
    for image_path in image_paths:
        if Path(image_path).exists():
            files.append(("files", open(image_path, "rb")))
        else:
            print(f"⚠ Image not found: {image_path}")
    
    if not files:
        print("✗ No valid image files found")
        return False
    
    try:
        response = requests.post(f"{API_URL}/predict-batch", files=files)
        results = response.json()
        
        print(f"✓ Batch prediction results:")
        for i, result in enumerate(results['results'], 1):
            print(f"  Image {i}: {result['filename']}")
            if 'error' in result:
                print(f"    Error: {result['error']}")
            else:
                print(f"    - Predicted class: {result['predicted_class']}")
                print(f"    - Confidence: {result['confidence']:.2%}")
        return True
    except Exception as e:
        print(f"✗ Batch prediction failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("CNN Image Classification API - Test Suite")
    print("=" * 60)
    
    # Test if API is running
    print(f"Connecting to API at {API_URL}...\n")
    try:
        response = requests.get(f"{API_URL}/")
        print(f"✓ API is running")
    except requests.exceptions.ConnectionError:
        print(f"✗ Cannot connect to API at {API_URL}")
        print("\nPlease start the API first:")
        print("  python main.py")
        print("  OR")
        print("  uvicorn main:app --reload")
        return
    
    # Run tests
    all_passed = True
    
    # Test 1: Health check
    if not test_health():
        all_passed = False
    
    # Test 2: Get classes
    if not test_classes():
        all_passed = False
    
    # Test 3: Single prediction (if image provided)
    if len(sys.argv) > 1:
        if not test_single_prediction(sys.argv[1]):
            all_passed = False
        
        # Test 4: Batch prediction (if multiple images provided)
        if len(sys.argv) > 2:
            if not test_batch_prediction(sys.argv[1:]):
                all_passed = False
    else:
        print("\n" + "=" * 60)
        print("Usage for image testing:")
        print("  python test_api.py image1.jpg [image2.jpg image3.jpg ...]")
        print("=" * 60)
    
    # Summary
    print("\n" + "=" * 60)
    if all_passed:
        print("✓ All tests passed!")
    else:
        print("✗ Some tests failed. Check the output above.")
    print("=" * 60)
    
    # API Documentation
    print("\nAPI Documentation:")
    print(f"  - Swagger UI: {API_URL}/docs")
    print(f"  - ReDoc: {API_URL}/redoc")

if __name__ == "__main__":
    main()
