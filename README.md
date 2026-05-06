# VibeCAD MVP

VibeCAD is a deterministic, headless CAD generation pipeline based strictly on a JSON Intermediate Spec, powered by LLM intent parsing and a real-time Babylon.js rendering engine. It translates natural language, voice commands, and 2D sketches into manifold 3D printable meshes.

## Architecture

VibeCAD uses a **Unified App** architecture built on Next.js (App Router). All core business logic, API routes, testing, and UI components reside within the `frontend/` directory.

- **CSG Engine (`frontend/src/lib/csg_engine.ts`):** A headless math utility utilizing `@jscad/modeling` to process programmatic shape additions, subtractions, and SVG extrusions deterministically.
- **Intent Parsing (`frontend/src/app/api/generate/route.ts`):** Connects to the OpenAI API using `gpt-4o-2024-08-06` and Zod's `zodResponseFormat`. It guarantees that conversational input outputs a strictly typed `CADModelSpec` array. It is context-aware, receiving the user's current model state to allow for iterative modifications.
- **Viewport (`frontend/src/components/Viewport.tsx`):** A Babylon.js canvas that converts the JSCAD geometry into triangular `VertexData` using robust `earcut` triangulation. It handles PBR materials (simulating 3D printing filaments) and provides rich animation transitions.
- **State Management (`frontend/src/store/useCADStore.ts`):** A Zustand store that handles global state and maintains a history stack for reliable Undo/Redo operations.

## Features Delivered (Epics 1-5 Complete)

* **Strict JSON CAD Schema:** Enforces standard geometric rules for cubes, spheres, cylinders, and extrusions.
* **Voice-to-Text Pipeline:** Native browser Web Speech API hook for "Push to Talk" prompt generation.
* **2D-to-3D Extrusion:** Drag-and-drop an image to extract its SVG contour and automatically extrude it into the 3D scene (using a simulated Vision API).
* **Filament Shaders:** Dynamically swap the viewport rendering material between Matte PLA, Glossy PETG, Flexible TPU, and Shiny Silk PBR configurations.
* **Diff Visualization Holograms:** When the AI modifies a shape, the viewport temporarily renders a glowing hologram (Green for Add, Red for Subtract/Remove, Yellow for Modify) to visually highlight the exact structural change before applying the final geometry.
* **Robust Export:** Headless generation allows for clean, printable STL downloads directly from the viewport.

## Prerequisites

- Node.js (>= 18)
- npm
- An OpenAI API Key

## Setup & Installation

1. Clone the repository.
2. Navigate to the unified application directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env.local` file in the `frontend/` directory and add your API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Running the Application

To start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

VibeCAD strictly enforces a test-driven foundation.

**Mathematical Unit Tests (CSG Engine)**
```bash
npx vitest run
```

**End-to-End UI Tests (Playwright)**
Ensure your dev server is running, or let Playwright start it automatically:
```bash
npx playwright test
```
