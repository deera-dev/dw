import { create } from 'zustand';

type WeightFormState = {
  modalVisible: boolean;
  editingId: string | null;
  weight: string;
  height: string;
  openModal: (currentHeightCm?: number | null) => void;
  openEditModal: (id: string, weightKg: number, currentHeightCm?: number | null) => void;
  closeModal: () => void;
  setWeight: (v: string) => void;
  setHeight: (v: string) => void;
  reset: () => void;
};

// Catat berat & tinggi digabung jadi satu form (satu modal) supaya tidak
// perlu dua alur terpisah untuk dua data yang selalu dilihat berdampingan.
export const useWeightFormStore = create<WeightFormState>((set) => ({
  modalVisible: false,
  editingId: null,
  weight: '',
  height: '',
  openModal: (currentHeightCm) =>
    set({
      modalVisible: true,
      editingId: null,
      weight: '',
      height: currentHeightCm ? String(currentHeightCm) : '',
    }),
  openEditModal: (id, weightKg, currentHeightCm) =>
    set({
      modalVisible: true,
      editingId: id,
      weight: String(weightKg),
      height: currentHeightCm ? String(currentHeightCm) : '',
    }),
  closeModal: () => set({ modalVisible: false }),
  setWeight: (weight) => set({ weight }),
  setHeight: (height) => set({ height }),
  reset: () => set({ weight: '', height: '', editingId: null }),
}));
