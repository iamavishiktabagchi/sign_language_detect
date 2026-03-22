import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Enterprise Hook for managing Bi-Directional Sign Language WebSockets
 * Streams video frames at a set FPS to the FastAPI backend and receives smooth NLP translations.
 */
export function useSignComm(videoRef: React.RefObject<HTMLVideoElement | null>, isRecording: boolean) {
  const [translation, setTranslation] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const animationFrameId = useRef<number | null>(null);
  
  // Adjustable framerate for backend payload size optimization
  const FPS = 15;
  const frameInterval = 1000 / FPS;
  let lastFrameTime = 0;

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Connect to the local FastAPI server
    wsRef.current = new WebSocket('ws://localhost:8000/ws/video');

    wsRef.current.onopen = () => {
      console.log('Connected to Enterprise Translation Engine');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'success' && data.smoothed_translation) {
           setTranslation((prev) => {
              if (prev !== data.smoothed_translation && data.smoothed_translation !== "") {
                 // Trigger Text-to-Speech
                 if ('speechSynthesis' in window) {
                     const utterance = new SpeechSynthesisUtterance(data.smoothed_translation);
                     utterance.rate = 1.0;
                     utterance.pitch = 1.0;
                     window.speechSynthesis.speak(utterance);
                 }
                 return data.smoothed_translation;
              }
              return prev;
           });
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    wsRef.current.onclose = () => {
      console.log('Disconnected from Translation Engine');
    };
  }, []);

  const captureAndSendFrame = useCallback((timestamp: number) => {
     if (!isRecording || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !videoRef.current) {
        if (isRecording) {
            animationFrameId.current = requestAnimationFrame(captureAndSendFrame);
        }
        return;
     }

     if (timestamp - lastFrameTime >= frameInterval) {
         const video = videoRef.current;
         const canvas = document.createElement('canvas');
         // Downscale to 640x480 for bandwidth optimization without losing MediaPipe fidelity
         canvas.width = 640; 
         canvas.height = 480;
         
         const ctx = canvas.getContext('2d');
         if (ctx) {
             ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
             // Use high compression JPEG
             const base64Frame = canvas.toDataURL('image/jpeg', 0.5);
             
             wsRef.current.send(JSON.stringify({ frame: base64Frame }));
         }
         lastFrameTime = timestamp;
     }
     
     animationFrameId.current = requestAnimationFrame(captureAndSendFrame);
  }, [isRecording, videoRef, frameInterval]);

  useEffect(() => {
     if (isRecording) {
         connectWebSocket();
         animationFrameId.current = requestAnimationFrame(captureAndSendFrame);
     } else {
         if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
         if (wsRef.current) {
             wsRef.current.close();
             wsRef.current = null;
         }
         setTranslation("");
     }

     return () => {
         if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
         if (wsRef.current) {
             wsRef.current.close();
         }
     };
  }, [isRecording, connectWebSocket, captureAndSendFrame]);

  return { translation };
}
