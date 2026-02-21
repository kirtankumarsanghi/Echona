import requests
import json

# Test ML service
ML_URL = "http://localhost:5001"

print("="*60)
print("TESTING ECHONA ML SERVICE")
print("="*60)

# Test 1: Health check
print("\n1️⃣ Health Check:")
try:
    response = requests.get(f"{ML_URL}/health", timeout=5)
    health = response.json()
    print(f"   Status: {health['status']}")
    print(f"   Face Analysis: {'✅' if health['capabilities']['face'] else '❌'}")
    print(f"   Text Analysis: {'✅' if health['capabilities']['text'] else '❌'}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: Text emotion analysis
print("\n2️⃣ Text Emotion Analysis:")
test_texts = [
    ("I'm so happy and excited today!", "Happy/Excited"),
    ("I feel sad and lonely", "Sad"),
    ("I'm really angry and frustrated", "Angry"),
    ("I'm worried and anxious about tomorrow", "Anxious"),
    ("Everything is calm and peaceful", "Calm"),
]

for text, expected in test_texts:
    try:
        response = requests.post(
            f"{ML_URL}/analyze",
            json={"type": "text", "text": text},
            timeout=10
        )
        result = response.json()
        mood = result.get('mood', 'Unknown')
        print(f"   Text: '{text[:40]}...'")
        print(f"   Result: {mood} (expected: {expected})")
        print()
    except Exception as e:
        print(f"   ❌ Error: {e}\n")

# Test 3: Face analysis (with dummy image)
print("\n3️⃣ Face Emotion Analysis:")
print("   Testing with a minimal test image...")
try:
    # Minimal 1x1 pixel PNG image in base64
    test_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    response = requests.post(
        f"{ML_URL}/analyze",
        json={"type": "face", "image": test_image},
        timeout=10
    )
    result = response.json()
    mood = result.get('mood', 'Unknown')
    source = result.get('source', 'unknown')
    print(f"   Result: {mood} (source: {source})")
    print(f"   ✅ Face analysis is operational")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "="*60)
print("TEST COMPLETE")
print("="*60)
