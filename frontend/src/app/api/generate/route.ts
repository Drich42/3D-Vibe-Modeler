import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build' });

const OperationSchema = z.enum(['add', 'subtract']);
const ShapeTypeSchema = z.enum(['cube', 'sphere', 'cylinder']);

const BaseShapeSchema = z.object({
  id: z.string(),
  position: z.tuple([z.number(), z.number(), z.number()]),
  rotation: z.tuple([z.number(), z.number(), z.number()]).optional(),
  operation: OperationSchema,
});

const CubeShapeSchema = BaseShapeSchema.extend({
  type: z.literal('cube'),
  size: z.tuple([z.number(), z.number(), z.number()]),
});

const SphereShapeSchema = BaseShapeSchema.extend({
  type: z.literal('sphere'),
  radius: z.number(),
});

const CylinderShapeSchema = BaseShapeSchema.extend({
  type: z.literal('cylinder'),
  radius: z.number(),
  height: z.number(),
});

const ShapeSchema = z.discriminatedUnion('type', [
  CubeShapeSchema,
  SphereShapeSchema,
  CylinderShapeSchema,
]);

const CADModelSpecSchema = z.object({
  version: z.string(),
  shapes: z.array(ShapeSchema),
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, currentSpec } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an expert CAD engineer. Your goal is to translate user natural language requests into a strict JSON representation of 3D geometry using Constructive Solid Geometry (CSG).
The JSON MUST match the provided schema exactly.
The supported shapes are 'cube', 'sphere', and 'cylinder'.
Operations can be 'add' or 'subtract'. The very first shape MUST be 'add'.
Rotations are in degrees [x, y, z].
Positions are in millimeters [x, y, z].
Sizes are in millimeters [width, height, depth] for cubes.
Radii and heights are in millimeters for spheres and cylinders.

${currentSpec ? `The user is modifying an existing model. The current model spec is:\n${JSON.stringify(currentSpec, null, 2)}\nIf the user asks to modify something, try to update the properties of the existing shapes in the array. If they ask to add something new, append it to the shapes array. If they ask to remove something, you can remove it or set its operation to 'subtract'.` : `The user is starting from scratch.`}
`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const completion = await openai.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages,
      response_format: zodResponseFormat(CADModelSpecSchema, 'cad_model_spec'),
      temperature: 0,
    });

    const parsedSpec = completion.choices[0].message.parsed;

    if (!parsedSpec) {
      return NextResponse.json({ error: 'Failed to generate valid CAD spec' }, { status: 500 });
    }

    return NextResponse.json({ spec: parsedSpec });
  } catch (error: any) {
    console.error('LLM Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during generation' },
      { status: 500 }
    );
  }
}
