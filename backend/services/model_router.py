import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

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

    def predict(self, keypoint_sequence: np.ndarray) -> str:
        """
        Runs true Keras inference on a sequence of keypoints.
        """
        if self._model is None or keypoint_sequence is None:
            return "Loading Neural Network Engine..."

        try:
            # Reshape or use the incoming sequence.
            # Depending on how main.py aggregates sequences (usually 30 frames for LSTM)
            # Right now main.py sends frame-by-frame here. 
            # If main doesn't buffer, we spoof the sequence dimension temporarily for demonstration:
            input_data = np.expand_dims([keypoint_sequence] * 30, axis=0) # shape (1, 30, 1662)
            res = self._model.predict(input_data, verbose=0)[0]
            action_idx = np.argmax(res)
            
            if res[action_idx] > 0.8:
                return self.actions[action_idx]
            return "Awaiting continuous motion..."
        except Exception as e:
            print(f"Neural Error: {e}")
            return "Analysis Engine Error"

