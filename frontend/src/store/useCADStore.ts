import { create } from 'zustand';
import { CADModelSpec } from '../types/cad';

interface CADState {
  modelSpec: CADModelSpec | null;
  pastSpecs: CADModelSpec[];
  futureSpecs: CADModelSpec[];
  setSpec: (spec: CADModelSpec) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export const useCADStore = create<CADState>((set) => ({
  modelSpec: null,
  pastSpecs: [],
  futureSpecs: [],
  setSpec: (spec) => set((state) => {
    // Only push to past if there's a valid current state and it's different
    if (state.modelSpec) {
      return {
        modelSpec: spec,
        pastSpecs: [...state.pastSpecs, state.modelSpec],
        futureSpecs: [], // Clear future on new action
      };
    }
    return { modelSpec: spec, pastSpecs: [], futureSpecs: [] };
  }),
  undo: () => set((state) => {
    if (state.pastSpecs.length === 0 || !state.modelSpec) return state;

    const newPast = [...state.pastSpecs];
    const previousSpec = newPast.pop() as CADModelSpec;

    return {
      modelSpec: previousSpec,
      pastSpecs: newPast,
      futureSpecs: [state.modelSpec, ...state.futureSpecs],
    };
  }),
  redo: () => set((state) => {
    if (state.futureSpecs.length === 0 || !state.modelSpec) return state;

    const newFuture = [...state.futureSpecs];
    const nextSpec = newFuture.shift() as CADModelSpec;

    return {
      modelSpec: nextSpec,
      pastSpecs: [...state.pastSpecs, state.modelSpec],
      futureSpecs: newFuture,
    };
  }),
  clear: () => set({ modelSpec: null, pastSpecs: [], futureSpecs: [] }),
}));
