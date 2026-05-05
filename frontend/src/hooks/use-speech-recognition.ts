import { useState, useEffect, useCallback } from 'react';

// Extend window object to include webkitSpeechRecognition for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = true; // We want to show what is being spoken
        reco.lang = 'en-US';

        reco.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        reco.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setError(event.error);
          setIsListening(false);
        };

        reco.onend = () => {
          setIsListening(false);
        };

        setRecognition(reco);
      } else {
        setError('Browser does not support Speech Recognition.');
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition) {
      setError(null);
      setTranscript('');
      setIsListening(true);
      try {
        recognition.start();
      } catch (err) {
        // Sometimes start is called when it's already started
        console.warn('Speech recognition start error', err);
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
    isSupported: !!recognition,
  };
}
