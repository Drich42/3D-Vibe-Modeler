# VibeCAD

VibeCAD is a bottom-up development project aimed at building a deterministic, headless CAD generation pipeline based strictly on a JSON Intermediate Spec. It leverages Constructive Solid Geometry (CSG) to process programmatic shape additions and subtractions.

## Current State

The project has just completed **Epic 1, Issue 1.1: Headless CSG Engine**.

Currently, the codebase contains:
- A strict TypeScript schema for defining CAD models via JSON (`src/types/cad.ts`). Supported shapes include cubes, spheres, and cylinders with boolean operations (`add` and `subtract`).
- A Headless CSG Engine (`src/csg_engine.ts`) utilizing `@jscad/modeling` to compute final geometry deterministically.
- A robust unit test suite using `vitest` covering edge cases, such as preventing invalid starting operations and verifying subtracted hole sizes.

## Prerequisites

- Node.js (>= 18)
- npm

## Installation

1. Clone the repository.
2. Install the project dependencies:

```bash
npm install
```

## Running Tests

The project follows a strict "Bottom-Up" rule, ensuring that all utility functions are thoroughly tested before moving on to UI components.

To run the unit tests using Vitest:

```bash
npm test
```

## Architecture

* `src/types/cad.ts`: Defines the `CADModelSpec` schema that dictates the shapes, their properties, and boolean operations.
* `src/csg_engine.ts`: Parses the `CADModelSpec` and converts it into 3D geometry using `@jscad/modeling`.
* `tests/`: Contains the Vitest specs used to validate the generation engine.

## Future Plans (Epic Roadmap)

1. **Epic 1**: Finish Robust CAD Core (Backend & Logic) by adding a strict validation layer and a Headless STL/GLB Exporter.
2. **Epic 2**: Connect the headless engine to a Babylon.js viewport and synchronize state.
3. **Epic 3**: Build an intent parsing and Voice Integration layer to link human thought to the JSON intermediate spec via LLMs.
4. **Epic 4**: Introduce 2D-to-3D Extrusion workflows from images to clean 2D contours.
5. **Epic 5**: Add iteration loops like action history (undo/redo), diff visualization, and E2E testing.
