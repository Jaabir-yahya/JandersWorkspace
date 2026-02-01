"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Phone, Square, Mic, MicOff } from "lucide-react";
// Inline utility function (Vercel best practice: avoid barrel imports)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ").trim();
}

// Apply Vercel best practices: memo for performance
interface VoiceRecordingProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const VoiceRecording = ({
  onTranscript,
  className,
}: VoiceRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [duration, setDuration] = useState(0);

  // Store callback in ref for stability (Vercel best practice)
  const transcriptRef = useRef(onTranscript);
  const stableOnTranscript = useCallback((text: string) => {
    transcriptRef.current(text);
  }, []);

  // Memoized speech recognition setup (performance optimization)
  const setupSpeechRecognition = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !("webkitSpeechRecognition" in window)
    ) {
      return null;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US"; // Fallback, will focus on Swahili later

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      const confidence = event.results[current][0].confidence;

      setTranscript((prev) => prev + " " + transcript);
      setConfidence(confidence);
      stableOnTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    return recognition;
  }, [stableOnTranscript]);

  const startRecording = useCallback(() => {
    const recognition = setupSpeechRecognition();
    if (!recognition) {
      // Fallback to manual input
      alert("Voice recording not supported. Please use the text input.");
      return;
    }

    setTranscript("");
    setDuration(0);
    setIsRecording(true);

    recognition.start();

    // Track duration
    const startTime = Date.now();
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Store interval ID for cleanup
    (window as any).recordingInterval = interval;
  }, [setupSpeechRecognition]);

  const stopRecording = useCallback(() => {
    if ((window as any).recordingInterval) {
      clearInterval((window as any).recordingInterval);
      (window as any).recordingInterval = null;
    }

    const recognition = setupSpeechRecognition();
    if (recognition) {
      recognition.stop();
    }
  }, [setupSpeechRecognition]);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setConfidence(0);
    setDuration(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return (
    <div className={cn("bg-white rounded-lg border p-6 space-y-4", className)}>
      <div className="text-center mb-4">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
          <Mic className="h-4 w-4" />
          <span>Voice Recording</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "mx-auto px-6 py-3 rounded-lg font-medium transition-colors",
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white",
            )}
          >
            <div className="flex items-center space-x-2">
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span>Stop ({duration}s)</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>Start Recording</span>
                </>
              )}
            </div>
          </button>
        </div>

        {isRecording && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-pulse bg-red-500 h-2 w-2 rounded-full"></div>
              <span className="text-sm font-medium text-red-800">
                Recording...{" "}
                {confidence > 0.7 ? "High Confidence" : "Keep speaking"}
              </span>
            </div>
            <div className="min-h-[100px] max-h-[200px] overflow-y-auto bg-gray-50 rounded p-3">
              <p className="text-sm text-gray-700">
                {transcript || "Listening..."}
              </p>
            </div>
          </div>
        )}

        {transcript && !isRecording && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Square className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Transcript
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {transcript}
            </p>
            <button
              onClick={clearTranscript}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
