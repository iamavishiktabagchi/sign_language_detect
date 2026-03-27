from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
from services.model_router import ModelRouter
from services.mediapipe_utils import process_frame

app = FastAPI(title="Sign Language Translation Platform")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_router = ModelRouter()

@app.on_event("startup")
async def startup_event():
    # Load the default ASL dictionary (the existing prototype model)
    model_router.load_model("default_asl", "models/my_model.keras")

@app.get("/")
def read_root():
    return {"status": "Enterprise Sign Language Backend is Active"}

@app.get("/models")
def list_models():
    """Returns available global sign language models."""
    return {"available_models": ["default_asl"], "active_model": model_router.active_model_name}

@app.post("/models/switch/{model_name}")
def switch_model(model_name: str):
    """Dynamically switch to a different sign language database/model."""
    success = model_router.switch_model(model_name)
    if success:
         return {"message": f"Successfully switched to {model_name}"}
    return {"error": "Model not found or failed to load"}, 400

@app.websocket("/ws/video")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket Connection Established")
    try:
        while True:
            # We expect a JSON payload containing base64 video frame and optional settings
            data = await websocket.receive_text()
            payload = json.loads(data)
            frame_data = payload.get("frame")
            
            # Process the frame via MediaPipe
            keypoints = process_frame(frame_data)
            
            # Run inference dynamically using the active model
            prediction = model_router.predict(keypoints)
            
            # TODO: Integrate LLM smoothing here before returning
            
            await websocket.send_text(json.dumps({
                "gloss": prediction,
                "smoothed_translation": prediction, # Placeholder for LLM
                "status": "success"
            }))
    except WebSocketDisconnect:
        print("WebSocket Connection Closed")
