'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18nContext } from '@/lib/i18n/i18n-react';

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<unknown>(null);
  const { LL } = useI18nContext();

  function startRecording() {
    setError('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError(LL.addMeal.voiceNotSupported());
      return;
    }
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (e: Event & { results: SpeechRecognitionResultList }) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join('');
      setTranscript(t);
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => {
      setError('Could not access microphone.');
      setRecording(false);
    };
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  }

  function stopRecording() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recognitionRef.current as any)?.stop();
    setRecording(false);
  }

  return (
    <div className="space-y-4 flex flex-col items-center">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg
          ${recording
            ? 'bg-destructive hover:bg-destructive/90 animate-pulse'
            : 'fab-glow'
          }`}
      >
        {recording
          ? <MicOff className="h-8 w-8 text-white" />
          : <Mic className="h-8 w-8 text-white" />}
      </button>
      <p className="text-sm text-muted-foreground">{recording ? LL.addMeal.listening() : LL.addMeal.tapToRecord()}</p>

      {transcript && (
        <div className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-sm text-foreground/80 italic">
          &ldquo;{transcript}&rdquo;
        </div>
      )}
      {error && <p className="text-xs text-destructive text-center">{error}</p>}

      {transcript && !recording && (
        <Button className="w-full" onClick={() => onTranscript(transcript)}>
          <Send className="h-4 w-4 mr-1" /> {LL.addMeal.analyseThisMeal()}
        </Button>
      )}
    </div>
  );
}
