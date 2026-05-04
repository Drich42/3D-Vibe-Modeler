'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CADModelSpec } from '../types/cad';
import { parsePromptToJSON } from '../utils/parser';

interface PromptInputProps {
  onGenerate: (spec: CADModelSpec) => void;
}

export function PromptInput({ onGenerate }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Simulate API call to LLM
    setTimeout(() => {
      const spec = parsePromptToJSON(prompt);
      onGenerate(spec);
      setIsGenerating(false);
    }, 500);
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
