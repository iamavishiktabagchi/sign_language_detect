import { useState, useEffect, useCallback } from 'react';

/**
 * Enterprise Hook for Dictation Mode
 * Leverages the Web Speech API (SpeechRecognition) to provide highly accurate
 * speech-to-text dictation that will map to Avatar sign synthesis.
 */
export function useDictation() {
    const [transcript, setTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    // Use any type because SpeechRecognition is not fully typed in standard DOM lib yet without extra packages
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rcg = new SpeechRecognition();
            rcg.continuous = true;
            rcg.interimResults = true;
            rcg.lang = 'en-US';

            rcg.onresult = (event: any) => {
                let currentTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
            };

            rcg.onerror = (event: any) => {
                console.error("Speech Recognition Error", event.error);
                setIsListening(false);
            };

            rcg.onend = () => {
                if (isListening) {
                    rcg.start(); // Restart if it was stopped unexpectedly but we want to keep listening
                }
            };

            setRecognition(rcg);
        } else {
            console.warn("Speech Synthesis / Recognition is not supported in this browser.");
        }
    }, [isListening]);

    const toggleDictation = useCallback(() => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            setTranscript("");
            recognition.start();
            setIsListening(true);
        }
    }, [isListening, recognition]);

    // Function to trigger the avatar synthesis backend API
    const synthesizeToAvatar = useCallback((text: string) => {
        if (!text.trim()) return;
        // In the Enterprise App, this triggers a REST call to the backend
        // e.g. fetch('/api/synthesize', { body: { text } })
        // which returns the animation sequence for the AvatarCanvas.
        console.log("Synthesizing string to Avatar sequence:", text);
    }, []);

    return { transcript, isListening, toggleDictation, synthesizeToAvatar, setTranscript };
}
