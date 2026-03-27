import mediapipe as mp
import numpy as np

mp_holistic = mp.solutions.holistic

def extract_keypoints(results):
    """
    Extracts pose, face, and hand landmarks into a flattened numpy array format
    expected by the Keras LSTM model.
    """
    # 33 landmarks * 4 dimensions = 132
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33 * 4)
    
    # 468 landmarks * 3 dimensions = 1404
    face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten() if results.face_landmarks else np.zeros(468 * 3)
    
    # 21 landmarks * 3 dimensions = 63
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21 * 3)
    
    # 21 landmarks * 3 dimensions = 63
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21 * 3)
    
    # Total shape = 132 + 1404 + 63 + 63 = 1662 features per frame
    return np.concatenate([pose, face, lh, rh])

def process_frame(frame_data_base64: str) -> np.ndarray:
    """
    Decodes base64 frame from WebSocket, processes it through MediaPipe Holistic,
    and returns the extracted keypoints vector.
    """
    import cv2
    import base64
    
    try:
        if frame_data_base64.startswith('data:image'):
            # Strip base64 header if present
            frame_data_base64 = frame_data_base64.split(',')[1]
            
        img_bytes = base64.b64decode(frame_data_base64)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        # Initialize holistic model (in an enterprise app this would be a persistent instance)
        with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
            # MediaPipe processing
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            image_rgb.flags.writeable = False
            results = holistic.process(image_rgb)
            
            # Extract formatted keypoints
            keypoints = extract_keypoints(results)
            return keypoints
    except Exception as e:
        print(f"Error processing frame: {e}")
        return np.zeros(1662)

