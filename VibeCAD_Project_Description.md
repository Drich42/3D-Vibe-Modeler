\# VibeCAD: Bottom-Up Development Plan (GitHub Epics)



This document translates the VibeCAD product vision into a structured, bottom-up implementation plan ready for GitHub Projects. It is designed to be executed by a 5-person autonomous agent team (or human counterparts).



\## The Team Perspectives

\*   \*\*Chief Engineer (Claude-style):\*\* Focuses on strict TypeScript typing, Clean Architecture, deterministic CAD generation, and performance.

\*   \*\*Creative Director (Grok-style):\*\* Focuses on user delight, real-time feedback loops, shader aesthetics (filament simulation), and reducing UI friction.

\*   \*\*Senior Coder:\*\* Focuses on execution: writing React components, connecting APIs, writing Vitest/Playwright tests, and satisfying ESLint.

\*   \*\*QA Tester:\*\* Focuses on failure states: non-manifold meshes, API timeouts, voice transcription errors, and UI regressions.

\*   \*\*Product Manager:\*\* Focuses on scope containment, sequencing Epics to guarantee a functional MVP at every stage, and unblocking the team.



\---



\## Epic 1: The Robust CAD Core (Backend \& Logic First)

\*\*Goal:\*\* Establish a deterministic, headless CAD generation pipeline based \*strictly\* on the JSON Intermediate Spec. We start at the bottom—if the math doesn't work, the UI doesn't matter.



\*   \*\*Issue 1.1: Implement Headless CSG Engine (Chief Engineer \& Senior Coder)\*\*

&#x20;   \*   \*Task:\* Build a TypeScript utility module that takes the `CADModelSpec` (with `add` and `subtract` operations) and uses a CSG (Constructive Solid Geometry) library (e.g., `csg.js` or Babylon's native CSG) to compute the final geometry mathematically without a viewport.

&#x20;   \*   \*QA:\* Test edge cases: What happens if a subtracted hole is larger than the base object? Does it crash or return valid partial geometry?

\*   \*\*Issue 1.2: Strict Validation Layer (QA Tester)\*\*

&#x20;   \*   \*Task:\* Implement a validator function that runs \*before\* geometry generation. It must reject specs that will cause non-manifold errors (e.g., zero-thickness walls).

\*   \*\*Issue 1.3: Headless STL/GLB Exporter (Senior Coder)\*\*

&#x20;   \*   \*Task:\* Ensure the exporter can run purely on the generated geometry arrays, independent of Babylon's `Scene` object, to allow for future backend rendering or background-thread processing.



\## Epic 2: The Viewport \& Sensory Feedback

\*\*Goal:\*\* Connect the headless engine to the Babylon.js viewport and make it look and feel like a premium tool.



\*   \*\*Issue 2.1: Viewport State Synchronization (Senior Coder)\*\*

&#x20;   \*   \*Task:\* Use Zustand to bind the `CADModelSpec` to the `Viewport3D` component. When the JSON changes, the mesh must rebuild smoothly.

\*   \*\*Issue 2.2: Filament Material Shaders (Creative Director)\*\*

&#x20;   \*   \*Task:\* Write custom PBR (Physically Based Rendering) materials in Babylon for: Matte PLA, Glossy PETG, Flexible TPU, and Shiny Silk.

&#x20;   \*   \*Grok says:\* "If Silk PLA doesn't blind the user when they rotate the camera, it's not shiny enough."

\*   \*\*Issue 2.3: Viewport Transitions (Creative Director)\*\*

&#x20;   \*   \*Task:\* When a parameter changes (e.g., cube width 40mm -> 50mm), use Babylon animations to lerp the geometry rather than snapping instantly.



\## Epic 3: Intent Parsing \& Voice Integration

\*\*Goal:\*\* Build the bridge between human thought (text/voice) and the strict JSON spec.



\*   \*\*Issue 3.1: LLM System Prompt \& API Connector (Chief Engineer)\*\*

&#x20;   \*   \*Task:\* Write the prompt engineering to guarantee the LLM outputs valid JSON matching the `CADModelSpec` schema. Connect to OpenAI/Anthropic API. Handle JSON parsing errors gracefully.

\*   \*\*Issue 3.2: Voice-to-Text Pipeline (Product Manager \& Senior Coder)\*\*

&#x20;   \*   \*Task:\* Integrate Web Speech API. Build a prominent, satisfying "Push to Talk" UI component.

\*   \*\*Issue 3.3: Context-Aware Modification (Chief Engineer)\*\*

&#x20;   \*   \*Task:\* The LLM needs context. Pass the \*current\* `CADModelSpec` along with the user's voice command (e.g., "Make it taller") so the LLM knows to modify the `height` property of the existing object rather than creating a new one.

&#x20;   \*   \*QA:\* Test ambiguous commands like "make the hole bigger"—does it increase diameter or depth?



\## Epic 4: 2D-to-3D Extrusion (The Diagram Bridge)

\*\*Goal:\*\* Introduce image processing, but restrict it to clean, 2D contours to ensure printable success.



\*   \*\*Issue 4.1: Drag-and-Drop Dropzone (Senior Coder)\*\*

&#x20;   \*   \*Task:\* Implement a shadcn-based file upload component.

\*   \*\*Issue 4.2: Contour Extraction API (Chief Engineer)\*\*

&#x20;   \*   \*Task:\* Send the uploaded image to a Vision model (or run OpenCV via WebAssembly) to detect edges and extract an SVG path.

\*   \*\*Issue 4.3: SVG Extrusion in Viewport (Senior Coder \& Creative Director)\*\*

&#x20;   \*   \*Task:\* Parse the SVG path and use Babylon's `PolygonMeshBuilder` to extrude it.

&#x20;   \*   \*Grok says:\* "Add a laser-scan glow effect while the outline is being processed."



\## Epic 5: The Full "Vibe" Iteration Loop

\*\*Goal:\*\* Polish the user experience so they can iterate rapidly without breaking the model.



\*   \*\*Issue 5.1: Action History \& Undo/Redo (Chief Engineer)\*\*

&#x20;   \*   \*Task:\* Implement a robust undo/redo stack in Zustand, storing a history array of `CADModelSpec` objects.

\*   \*\*Issue 5.2: Diff Visualization (Creative Director)\*\*

&#x20;   \*   \*Task:\* When a user asks for a change, briefly highlight the modified faces/vertices in green (add) or red (subtract) before finalizing the morph.

\*   \*\*Issue 5.3: End-to-End E2E Tests (QA Tester)\*\*

&#x20;   \*   \*Task:\* Write Playwright scripts that simulate typing a prompt, waiting for the LLM API, checking canvas rendering, and verifying the downloaded STL is not empty.



\---



\## Workflow Rules for the Team:

1\.  \*\*Bottom-Up Rule:\*\* No UI component is built until its underlying utility function is written and unit tested.

2\.  \*\*Schema is Law:\*\* If the Creative Director wants a new feature (e.g., beveling), the Chief Engineer must update the `types/cad.ts` schema first.

3\.  \*\*No Silent Failures:\*\* The QA Tester requires that every API failure or non-manifold mesh error surfaces a polite, plain-English Toast notification via shadcn.



