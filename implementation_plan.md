# Scaffold VibeCAD Foundation & Epic 1 Prep

This plan outlines the steps to initialize the core Next.js application, install the primary dependencies, and set up the architectural structure necessary to begin work on **Epic 1: The Robust CAD Core**.

## User Review Required

> [!IMPORTANT]
> **Tailwind CSS Version Confirmation**
> By default, `create-next-app` will install the latest stable version of Tailwind CSS (typically v3). If you would like to use a specific version (like the new Tailwind v4 beta) or stick with the standard stable version, please confirm before I run the setup commands.

## Proposed Changes

### Scaffold Next.js Application
Initialize the project in the current directory (`C:\Users\arkyd\AGV\3DModeler`) using `create-next-app` with the following configuration:
- App Router enabled (`--app`)
- TypeScript enabled (`--ts`)
- Tailwind CSS enabled (`--tailwind`)
- ESLint enabled (`--eslint`)
- `src/` directory enabled (`--src-dir`)
- Git initialization skipped (since we already did it) (`--disable-git`)

### Install Core Dependencies
Install the required dependencies for the project:
- **State Management**: `zustand`
- **3D Engine**: `@babylonjs/core`
- **CSG Utility**: A headless CSG library (e.g., `@jscad/csg` or Babylon's native CSG tools depending on availability)
- **UI Foundations**: `lucide-react`, `clsx`, `tailwind-merge` (to prepare for shadcn components)

### Establish Core Architecture (Epic 1)
Create the foundational folders and files according to the *Chief Engineer's* perspective in the project description:

#### [NEW] src/types/cad.ts
Define the strict `CADModelSpec` interface that will act as the single source of truth for the application.

#### [NEW] src/store/useCadStore.ts
Initialize the Zustand store to hold the CAD model state and history (Undo/Redo prep).

#### [NEW] src/lib/csg.ts
Create the headless CSG utility module that will consume `CADModelSpec` and generate the underlying mathematical geometry.

## Verification Plan

### Automated Tests
- Verify the Next.js development server starts successfully without errors.
- Ensure TypeScript compiles without any type errors.
- Verify ESLint passes on the generated template.

### Manual Verification
- Check the folder structure to ensure `src/` and `types/` are created correctly.
- Review `package.json` to confirm all dependencies are properly installed.
