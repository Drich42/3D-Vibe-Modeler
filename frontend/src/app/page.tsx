'use client';

import { useState } from 'react';
import { Viewport } from '@/components/Viewport';
import { PromptInput } from '@/components/PromptInput';
import { CADModelSpec } from '@/types/cad';

export default function Home() {
  const [modelSpec, setModelSpec] = useState<CADModelSpec | null>(null);

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 flex flex-col md:flex-row gap-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-6 w-full md:w-1/3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">VibeCAD MVP</h1>
          <p className="text-muted-foreground">
            Text-to-Primitive modeling using an intermediate JSON specification.
          </p>
        </div>
        <PromptInput onGenerate={(spec) => setModelSpec(spec)} onClear={() => setModelSpec(null)} currentSpec={modelSpec} />
        {modelSpec && (
          <div className="bg-muted p-4 rounded-lg overflow-auto max-h-[300px]">
            <h3 className="font-semibold mb-2 text-sm">Generated Spec (JSON)</h3>
            <pre className="text-xs">
              {JSON.stringify(modelSpec, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="flex-grow w-full md:w-2/3 h-[600px] md:h-auto border rounded-xl overflow-hidden relative">
        {modelSpec ? (
          <Viewport modelSpec={modelSpec} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground">
            Generate a model to preview
          </div>
        )}
      </div>
    </main>
  );
}
