import requests
import sys

def check_status(url, name):
    try:
        response = requests.get(url, timeout=2)
        if response.status_code == 200:
            print(f"[OK] {name} is running at {url}")
            return True
        else:
            print(f"[!!] {name} returned status code {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"[OFFLINE] {name} is not reachable at {url}")
        return False
    except Exception as e:
        print(f"[ERROR] {name} check failed: {e}")
        return False

if __name__ == "__main__":
    print("--- Shiro AI Service Check ---")
    ollama_ok = check_status("http://localhost:11434/api/tags", "Ollama Engine")
    bridge_ok = check_status("http://localhost:3000", "Ollama Bridge")
    backend_ok = check_status("http://localhost:8000/status", "Shiro Backend")
    
    if ollama_ok and bridge_ok and backend_ok:
        print("\nAll systems green! Shiro AI is ready.")
        sys.exit(0)
    else:
        print("\nSome services are missing. Run Start_Shiro.bat to fix.")
        sys.exit(1)

