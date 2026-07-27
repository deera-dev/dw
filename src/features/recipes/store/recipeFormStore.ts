import { create } from 'zustand';
import type { Tables } from '../../../shared/types/database';

type Recipe = Tables<'recipes'>;

type RecipeFormState = {
  modalVisible: boolean;
  editingId: string | null;
  name: string;
  ingredients: string;
  instructions: string;
  openModal: () => void;
  openEditModal: (recipe: Recipe) => void;
  closeModal: () => void;
  setName: (v: string) => void;
  setIngredients: (v: string) => void;
  setInstructions: (v: string) => void;
  reset: () => void;
};

export const useRecipeFormStore = create<RecipeFormState>((set) => ({
  modalVisible: false,
  editingId: null,
  name: '',
  ingredients: '',
  instructions: '',
  openModal: () => set({ modalVisible: true, editingId: null }),
  openEditModal: (recipe) =>
    set({
      modalVisible: true,
      editingId: recipe.id,
      name: recipe.name,
      ingredients: recipe.ingredients ?? '',
      instructions: recipe.instructions ?? '',
    }),
  closeModal: () => set({ modalVisible: false }),
  setName: (name) => set({ name }),
  setIngredients: (ingredients) => set({ ingredients }),
  setInstructions: (instructions) => set({ instructions }),
  reset: () => set({ name: '', ingredients: '', instructions: '', editingId: null }),
}));
