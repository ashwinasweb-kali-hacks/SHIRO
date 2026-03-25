import sys
import os

# Add current directory to path
current_dir = os.path.abspath(os.path.dirname(__file__))
sys.path.append(current_dir)

try:
    from main import load_image_model, load_video_model
    print("--- Starting Model Downloads ---")
    
    print("1. Pre-loading Image Model (nota-ai/bk-sdm-tiny)...")
    load_image_model()
    
    print("2. Pre-loading Video Model (damo-vilab/text-to-video-ms-1.7b)...")
    load_video_model()
    
    print("\n[SUCCESS] All backend models are now downloaded and cached.")
except ImportError as e:
    print(f"Import Error: {e}. Make sure you are running this with the backend's virtual environment.")
except Exception as e:
    print(f"Error during model download: {e}")
