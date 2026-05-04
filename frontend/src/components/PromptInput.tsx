'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CADModelSpec } from '../types/cad';
import { useToast } from '@/hooks/use-toast';

interface PromptInputProps {
  onGenerate: (spec: CADModelSpec) => void;
  currentSpec?: CADModelSpec | null;
}

export function PromptInput({ onGenerate, currentSpec }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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
        <CardContent>
          <Textarea
            placeholder="Describe your model (e.g., 'Make a 40mm cube' or 'Make a 50mm sphere')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
            data-testid="prompt-input"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <span className="text-sm text-muted-foreground">MVP Phase 1: Try cubes and spheres!</span>
          <Button type="submit" disabled={isGenerating} data-testid="generate-btn">
            {isGenerating ? 'Generating...' : 'Generate 3D Model'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
