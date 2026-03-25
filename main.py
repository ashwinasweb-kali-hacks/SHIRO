import os
import base64
import qrcode
from typing import Optional
from io import BytesIO
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import torch

# Try importing diffusers; don't fail if not yet installed
try:
    from diffusers import StableDiffusionPipeline, TextToVideoSDPipeline
    from diffusers.utils import export_to_video
except ImportError:
    StableDiffusionPipeline = None
    TextToVideoSDPipeline = None
    export_to_video = None

app = FastAPI(title="Shiro AI Multimodal Backend")

# ── Path to the shiro/ project root ──────────────────────────────
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# ── CORS (allow all so the browser can reach us) ─────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Lazy-loaded AI pipelines ──────────────────────────────────────
pipelines = {"image": None, "video": None}


def get_device():
    return "cuda" if torch.cuda.is_available() else "cpu"


def load_image_model():
    if not StableDiffusionPipeline:
        raise Exception("Diffusers not installed. Run: pip install diffusers transformers accelerate torch")
    if pipelines["image"] is None:
        print("Loading image model (nota-ai/bk-sdm-tiny ~1GB)…")
        device = get_device()
        dtype = torch.float16 if device == "cuda" else torch.float32
        pipe = StableDiffusionPipeline.from_pretrained("nota-ai/bk-sdm-tiny", torch_dtype=dtype)
        pipe = pipe.to(device)
        pipelines["image"] = pipe
        print("Image model ready!")


def load_video_model():
    if not TextToVideoSDPipeline:
        raise Exception("Diffusers not installed. Run: pip install diffusers transformers accelerate torch")
    if pipelines["video"] is None:
        print("Loading video model (damo-vilab/text-to-video-ms-1.7b)…")
        device = get_device()
        dtype = torch.float16 if device == "cuda" else torch.float32
        pipe = TextToVideoSDPipeline.from_pretrained(
            "damo-vilab/text-to-video-ms-1.7b",
            torch_dtype=dtype,
            variant="fp16" if device == "cuda" else None
        )
        pipe = pipe.to(device)
        pipelines["video"] = pipe
        print("Video model ready!")


# ── Request models ────────────────────────────────────────────────
class ImageRequest(BaseModel):
    prompt: str
    num_inference_steps: Optional[int] = 20

class VideoRequest(BaseModel):
    prompt: str
    num_frames: Optional[int] = 8
    num_inference_steps: Optional[int] = 10

class QRRequest(BaseModel):
    text: str
    fill_color: Optional[str] = "black"
    back_color: Optional[str] = "white"
    size: Optional[int] = 10


# ── HTML page routes (must come before static mount) ─────────────

@app.get("/")
def serve_root():
    p = os.path.join(FRONTEND_DIR, "shiro.html")
    if os.path.exists(p):
        return FileResponse(p)
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/shiro")
@app.get("/shiro.html")
def serve_shiro():
    return FileResponse(os.path.join(FRONTEND_DIR, "shiro.html"))

@app.get("/login")
@app.get("/login.html")
def serve_login():
    return FileResponse(os.path.join(FRONTEND_DIR, "login.html"))

@app.get("/app")
@app.get("/app.html")
def serve_app():
    return FileResponse(os.path.join(FRONTEND_DIR, "app.html"))

@app.get("/status")
def status():
    return {
        "status": "Shiro AI backend running!",
        "image_loaded": pipelines["image"] is not None,
        "video_loaded": pipelines["video"] is not None,
        "device": get_device()
    }


# ── API routes ────────────────────────────────────────────────────

@app.post("/api/generate-image")
def generate_image(req: ImageRequest):
    try:
        load_image_model()
        print(f"[Image] Generating: '{req.prompt}' (steps={req.num_inference_steps})")
        result = pipelines["image"](req.prompt, num_inference_steps=req.num_inference_steps)
        image = result.images[0]

        buf = BytesIO()
        image.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return {"success": True, "image_base64": f"data:image/png;base64,{b64}"}
    except Exception as e:
        print(f"[Image] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-video")
def generate_video(req: VideoRequest):
    try:
        load_video_model()
        print(f"[Video] Generating: '{req.prompt}' ({req.num_frames}f/{req.num_inference_steps}s)")
        frames = pipelines["video"](
            req.prompt,
            num_frames=req.num_frames,
            num_inference_steps=req.num_inference_steps
        ).frames[0]

        tmp = os.path.join(os.path.dirname(__file__), "tmp_video.mp4")
        export_to_video(frames, tmp, fps=8)

        with open(tmp, "rb") as vf:
            b64 = base64.b64encode(vf.read()).decode("utf-8")
        if os.path.exists(tmp):
            os.remove(tmp)

        return {"success": True, "video_base64": f"data:video/mp4;base64,{b64}"}
    except Exception as e:
        print(f"[Video] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-qr")
def generate_qr(req: QRRequest):
    try:
        print(f"[QR] Generating for: '{req.text}'")
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=req.size,
            border=4,
        )
        qr.add_data(req.text)
        qr.make(fit=True)

        img = qr.make_image(fill_color=req.fill_color, back_color=req.back_color)
        buf = BytesIO()
        img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        
        return {"success": True, "image_base64": f"data:image/png;base64,{b64}"}
    except Exception as e:
        print(f"[QR] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Static file mounts (MUST come after all API / page routes) ───
for folder in ["Css", "JavaScript", "Assets", "Assests", "Images", "Fonts"]:
    fpath = os.path.join(FRONTEND_DIR, folder)
    if os.path.isdir(fpath):
        app.mount(f"/{folder}", StaticFiles(directory=fpath), name=folder.lower())


# ── Run ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n[Shiro AI] Backend starting...")
    print("   Open your browser: http://localhost:8000\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
