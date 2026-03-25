# 🐕 Shiro AI: The Ultimate Offline Multimodal Ecosystem
### *Privacy-First. Local Power. Hybrid Intelligence.*

Shiro AI is a cutting-edge, privacy-focused AI assistant designed by **AS ASHWIN**. It bridges the gap between fast local inference and massive cloud-scale reasoning, allowing you to chat, analyze images, and process video all from a single interface.

---

## 🌟 Key Features

* **🛡️ Total Privacy:** All text and image processing happens locally on your hardware. No data is sent to the cloud for Chat or Vision.
* **👁️ Multimodal Vision:** Powered by **LLaVA**, Shiro can describe images, read handwritten text, and identify objects.
* **🎬 Cinematic Intelligence:** Use the **Qwen 480B** API to summarize videos, detect scenes, and answer complex questions about video files.
* **⚡ Optimized Performance:** Uses **Llama 3.2B**, the gold standard for high-speed, low-latency local LLMs.
* **🖱️ One-Click Launch:** No complicated command lines—just run the batch files and go.

---

## 🚀 Installation & Launch Guide

### 1. Prerequisites
Before running Shiro AI, ensure you have the following installed:
* [Ollama](https://ollama.com/) (Required for Llama and LLaVA)
* [Python 3.10+](https://www.python.org/downloads/)

### 2. Setup API Keys
Since the **Qwen 480B** model is too large for consumer hardware, it requires an API key. 
1. Create a file named `.env` in the root folder.
2. Add your key: `QWEN_API_KEY=your_key_here`

### 3. Execution
To start the system, follow this sequence:
1.  **Double-click `backend.bat`**: Wait for the "Backend Ready" message.
2.  **Double-click `start_shiro.bat`**: This will launch the Shiro AI Interface.

---

## 💻 System Requirements

| Hardware | Minimum (Standard Chat) | Recommended (High Performance) |
| :--- | :--- | :--- |
| **CPU** | 4-Core (Intel i5/Ryzen 5) | 8-Core (Intel i7/Ryzen 7) |
| **GPU** | 4GB VRAM (NVIDIA GTX) | 12GB+ VRAM (NVIDIA RTX 3060+) |
| **RAM** | 8GB DDR4 | 16GB - 32GB DDR4/5 |
| **Storage** | 15GB SSD Space | 50GB NVMe M.2 SSD |
| **OS** | Windows 10/11 64-bit | Windows 11 64-bit |

---

## 🧠 Technical Architecture

* **Language Model:** Llama 3.2B (Local via Ollama)
* **Vision Model:** LLaVA Latest (Local via Ollama)
* **Video Model:** Qwen 480B (Remote via API)
* **Frontend:** Shiro-UI (Batch-loaded)
* **Backend:** Python-based FastAPI/Flask Wrapper

---

## 🛠️ Troubleshooting & FAQ

**Q: The window opens and immediately closes.**
> **A:** Ensure you have extracted all files from the `.zip` archive. Running inside a zip will fail. Also, check if **Ollama** is running in your system tray.

**Q: I get a "Model not found" error.**
> **A:** Open your terminal and run `ollama pull llama3.2` and `ollama pull llava` to manually download the weights.

**Q: How do I change the AI's personality?**
> **A:** You can modify the `config.json` file to adjust the system prompt for Shiro.

---

## 📞 Support & Community

If you encounter bugs or want to request a feature, reach out to the developer:

* **Developer:** AS ASHWIN
* **Email:** [ashwinasweb@gmail.com](mailto:ashwinasweb@gmail.com)
* **Status:** Active Development

---

## 📜 License & Copyright

Copyright © 2026 **AS ASHWIN**.

This project is licensed under the **MIT License**. You are free to use, modify, and distribute this software, provided the original copyright notice and permission notice are included in all copies or substantial portions of the software.

---
**Designed with ❤️ by AS ASHWIN**
