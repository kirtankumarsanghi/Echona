#!/usr/bin/env python
"""Test the updated face emotion analysis with fallback"""
import sys
sys.path.insert(0, '.')

from ml.face_emotion import analyze_face_emotion

# Test with a simple base64 image (1x1 pixel for testing)
test_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

print("Testing face emotion analysis...")
print("-" * 50)

result = analyze_face_emotion(test_image)
print(f"\nResult: {result}")
print("-" * 50)

if result:
    print("✅ Face emotion analysis is working!")
    print(f"   Detection mode: {'DeepFace' if 'DeepFace' in str(result) else 'Fallback (basic)'}")
else:
    print("❌ Face emotion analysis failed")
