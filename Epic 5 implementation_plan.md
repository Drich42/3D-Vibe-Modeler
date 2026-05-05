# Epic 5: The Full "Vibe" Iteration Loop

This is the final planned Epic for the VibeCAD MVP, focusing on robust state management, visual feedback for AI-driven modifications, and end-to-end testing reliability.

## User Review Required

> [!IMPORTANT]
> Please review the approach for **Diff Visualization**. Since the CSG engine collapses all shapes into a single mesh, highlighting individual modified faces *after* the boolean operations is mathematically complex. Instead, my proposed approach is to temporarily render the specific *primitive shapes* that were added or modified as separate semi-transparent glowing meshes (Green for Add, Red for Subtract) for 1 second *before* applying the final merged geometry. Does this align with the Creative Director's vision?

## Proposed Changes

### State Management (Zustand)

#### [NEW] `frontend/src/store/useCADStore.ts`
- Implement a Zustand store to handle the global state of the application.
- Include `modelSpec` (current state), `pastSpecs` (array for Undo history), and `futureSpecs` (array for Redo history).
- Expose methods: `setSpec()`, `undo()`, `redo()`, `clear()`.

#### [MODIFY] `frontend/src/app/page.tsx`
- Remove local `useState` for `modelSpec` and replace it with bindings to the new Zustand store.
- Wire up the Undo/Redo buttons to the top navigation bar or the PromptInput card.

### Diff Visualization

#### [MODIFY] `frontend/src/components/Viewport.tsx`
- Intercept state changes to `modelSpec`.
- Perform a shallow JSON diff against the previous `modelSpec` to identify which shapes (by `id`) were added, removed, or modified.
- Create temporary Babylon `Mesh` instances for these specific shapes.
- Apply a custom Emissive/Glowing PBRMaterial (Green for new/expanded, Red for deleted/shrunk).
- Hold the visualization for 1 second, fade it out, and then trigger the standard `scaleDown`/`scaleUp` transition to the final unified CSG geometry.

### E2E Testing (Playwright)

#### [NEW] `frontend/playwright.config.ts`
- Configure Playwright to run against the Next.js dev server.

#### [NEW] `frontend/tests/e2e/vibecad.spec.ts`
- Write automated tests that simulate the full user journey:
  1. Typing a prompt.
  2. Mocking the `/api/generate` response to ensure tests are deterministic and don't cost API credits.
  3. Verifying that the canvas correctly mounts and receives the geometry.
  4. Verifying the Undo/Redo stack successfully reverts the viewport.

## Verification Plan

### Automated Tests
- Run `npm run test` (Vitest) to ensure no regressions in the CSG Math.
- Run `npx playwright test` to verify the UI flow and Undo/Redo logic.

### Manual Verification
- Generate a base model.
- Speak a modification to the model.
- Observe the Green/Red Diff Visualization.
- Click Undo and verify the previous state is restored flawlessly.
