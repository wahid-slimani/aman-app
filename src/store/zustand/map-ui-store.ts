import { create } from "zustand";

type MapUiState = {
  selectedPointId: string | null;
  radiusKm: 10 | 20 | 50 | 100;
  setSelectedPointId: (id: string | null) => void;
  setRadiusKm: (radius: 10 | 20 | 50 | 100) => void;
};

export const useMapUiStore = create<MapUiState>((set) => ({
  selectedPointId: null,
  radiusKm: 20,
  setSelectedPointId: (id) => set({ selectedPointId: id }),
  setRadiusKm: (radius) => set({ radiusKm: radius })
}));
