'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CADModelSpec } from '../types/cad';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { Mic, MicOff } from 'lucide-react';
import { useEffect } from 'react';

interface PromptInputProps {
  onGenerate: (spec: CADModelSpec) => void;
  onClear?: () => void;
  currentSpec?: CADModelSpec | null;
}

export function PromptInput({ onGenerate, onClear, currentSpec }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { isListening, transcript, error, toggleListening, isSupported } = useSpeechRecognition();

  useEffect(() => {
    if (isListening && transcript) {
      setPrompt(transcript);
    }
  }, [isListening, transcript]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Microphone Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, currentSpec }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate model');
      }

      onGenerate(data.spec);
      setPrompt('');
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "An unexpected error occurred while communicating with the AI.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>AI CAD Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Describe your model (e.g., 'Make a 40mm cube' or 'Make a 50mm sphere')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={`min-h-[100px] resize-none pr-12 ${isListening ? 'ring-2 ring-primary border-primary' : ''}`}
              data-testid="prompt-input"
            />
            {isSupported && (
              <Button
                type="button"
                variant={isListening ? "destructive" : "secondary"}
                size="icon"
                className="absolute bottom-2 right-2 rounded-full shadow-sm"
                onClick={toggleListening}
                title={isListening ? "Stop Listening" : "Push to Talk"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
          {isListening && (
            <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
              <Mic className="h-4 w-4" /> Listening...
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">MVP Phase 1: Try cubes and spheres!</span>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {currentSpec && onClear && (
              <Button type="button" variant="outline" onClick={onClear} disabled={isGenerating}>
                Clear
              </Button>
            )}
            <Button type="submit" disabled={isGenerating || !prompt.trim()} data-testid="generate-btn">
              {isGenerating ? 'Generating...' : 'Generate 3D Model'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
