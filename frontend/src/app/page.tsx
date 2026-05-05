'use client';

import { useState } from 'react';
import { Viewport } from '@/components/Viewport';
import { PromptInput } from '@/components/PromptInput';
import { ImageUploader } from '@/components/ImageUploader';
import { CADModelSpec } from '@/types/cad';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [modelSpec, setModelSpec] = useState<CADModelSpec | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const handleImageSelected = async (file: File) => {
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract contour');
      }

      // Append or create a new model spec with the extruded SVG
      setModelSpec((prevSpec) => {
        const newShape = {
          id: `extrusion-${Date.now()}`,
          type: 'extrusion' as const,
          path: data.path,
          depth: 10, // Default 10mm extrusion
          position: [0, 0, 0] as [number, number, number],
          operation: 'add' as const,
        };

        if (prevSpec) {
          return {
            ...prevSpec,
            shapes: [...prevSpec.shapes, newShape],
          };
        } else {
          return {
            version: '1.0',
            shapes: [newShape],
          };
        }
      });

      toast({
        title: "Contour Extracted!",
        description: "Successfully extruded 2D image into 3D geometry.",
      });

    } catch (error: any) {
      toast({
        title: "Extraction Failed",
        description: error.message || "An unexpected error occurred processing the image.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 flex flex-col md:flex-row gap-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-6 w-full md:w-1/3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">VibeCAD MVP</h1>
          <p className="text-muted-foreground">
            Text-to-Primitive modeling using an intermediate JSON specification.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <PromptInput onGenerate={(spec) => setModelSpec(spec)} currentSpec={modelSpec} />
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-muted"></div>
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm">OR</span>
            <div className="flex-grow border-t border-muted"></div>
          </div>
          <ImageUploader onImageSelected={handleImageSelected} isProcessing={isExtracting} />
        </div>

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
