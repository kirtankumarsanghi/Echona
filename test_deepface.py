#!/usr/bin/env python
"""Test script to verify DeepFace installation"""
try:
    from deepface import DeepFace
    print("✅ DeepFace imported successfully!")
    print(f"   DeepFace version: {DeepFace.__version__ if hasattr(DeepFace, '__version__') else 'unknown'}")
    
    import cv2
    print("✅ OpenCV imported successfully!")
    
    import tensorflow as tf
    print(f"✅ TensorFlow imported successfully! Version: {tf.__version__}")
    
    import numpy as np
    print(f"✅ NumPy imported successfully! Version: {np.__version__}")
    
    print("\n🎉 All face analysis dependencies are working!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
