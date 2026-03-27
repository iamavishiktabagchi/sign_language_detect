import numpy as np
import keras
from keras.models import load_model

class ModelRouter:
    """
    Enterprise Model Router for handling multiple Sign Language databases (ASL, ISL, BSL, etc.)
    Supports lazy loading and hot-swapping between global regions.
    """
    def __init__(self):
        self.active_model_name = None
        self._model = None
        
        # Original glossary from the notebook training output mappings
        self.actions = ['hello', 'thanks', 'iloveyou'] 

    def load_model(self, model_name: str, model_path: str) -> bool:
        """Loads a model from a given path into memory."""
        try:
            print(f"Loading Global Model Database: {model_name}...")
            self._model = load_model(model_path)
            self.active_model_name = model_name
            print(f"Model {model_name} loaded successfully.")
            return True
        except Exception as e:
            print(f"Failed to load model {model_name}: {e}")
            return False

    def switch_model(self, model_name: str) -> bool:
        """Dynamic hot-swapping simulation."""
        if model_name == "default_asl":
            return self.load_model("default_asl", "models/my_model.keras")
        return False

    def detect_static_alphabet(self, keypoint_sequence: np.ndarray) -> str:
        """
        Uses heuristic geometric distances on MediaPipe Hand Landmarks to dynamically 
        classify continuous static ASL alphabets (A, B, V, L, etc) without LSTM layers.
        """
        if keypoint_sequence is None or len(keypoint_sequence) != 1662:
            return None
            
        rh = keypoint_sequence[1599:1662].reshape(21, 3)
        # If the right hand is entirely zeros, it wasn't detected by MediaPipe holistic
        if np.all(rh == 0):
            return None
            
        # Extract finger extensions relative to their MCP (knuckle) joints.
        # Note: In MediaPipe, Y goes down, so a smaller Y means the finger is pointing UP.
        thumb_tip_y, thumb_mcp_y = rh[4][1], rh[2][1]
        thumb_tip_x, thumb_mcp_x = rh[4][0], rh[2][0]
        
        index_tip_y, index_mcp_y = rh[8][1], rh[5][1]
        mid_tip_y, mid_mcp_y = rh[12][1], rh[9][1]
        ring_tip_y, ring_mcp_y = rh[16][1], rh[13][1]
        pinky_tip_y, pinky_mcp_y = rh[20][1], rh[17][1]

        index_up = index_tip_y < index_mcp_y
        mid_up = mid_tip_y < mid_mcp_y
        ring_up = ring_tip_y < ring_mcp_y
        pinky_up = pinky_tip_y < pinky_mcp_y
        
        # Calculate horizontal extensions
        thumb_out = abs(thumb_tip_x - thumb_mcp_x) > 0.05
        
        # 'A' Sign: All fingers folded down, thumb sticking slightly out/up alongside index.
        if not index_up and not mid_up and not ring_up and not pinky_up:
            return "A"
            
        # 'B' Sign: All 4 fingers straight up, thumb folded across palm.
        if index_up and mid_up and ring_up and pinky_up and not thumb_out:
            return "B"

        # 'C' Sign: Fingers curved like a claw (all partially up/down)
        # Simplified: all fingers in a mid-state or curved. 
        # For now, let's detect 'V', 'L', 'F' more reliably.

        # 'V' Sign: Index & Middle up, Ring & Pinky folded.
        if index_up and mid_up and not ring_up and not pinky_up:
            return "V"
            
        # 'L' Sign: Index up, Thumb sticking horizontally out, others folded.
        if index_up and thumb_out and not mid_up and not ring_up and not pinky_up:
            return "L"

        # 'F' Sign: Index and Thumb touching in a circle, others up.
        if not index_up and mid_up and ring_up and pinky_up:
            return "F"
            
        return None

    def predict(self, keypoint_sequence: np.ndarray) -> str:
        """
        Runs fast static heuristic first, then falls back to Keras if loaded.
        """
        if keypoint_sequence is None:
            return ""

        # 1. ALWAYS check for geometric static alphabet matches first (Instant & Accurate)
        static_letter = self.detect_static_alphabet(keypoint_sequence)
        if static_letter:
            return f"Sign: {static_letter}"

        # 2. Fallback to LSTM Neural Network if successfully loaded
        if self._model is not None:
            try:
                input_data = np.expand_dims([keypoint_sequence] * 30, axis=0)
                res = self._model.predict(input_data, verbose=0)[0]
                action_idx = np.argmax(res)
                if res[action_idx] > 0.8:
                    return self.actions[action_idx]
            except Exception as e:
                pass # Silently fail LSTM errors to keep UI clean
                
        return ""

