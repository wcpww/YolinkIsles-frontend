import { create } from 'zustand';

interface TagFilterStore {
  selectedTags: Set<string>;
  toggleTag: (tagId: string) => void;
  clearTags: () => void;
}

export const useTagFilterStore = create<TagFilterStore>((set) => ({
  selectedTags: new Set(),
  toggleTag: (tagId) =>
    set((state) => {
      const next = new Set(state.selectedTags);
      next.has(tagId) ? next.delete(tagId) : next.add(tagId);
      return { selectedTags: next };
    }),
  clearTags: () => set({ selectedTags: new Set() }),
}));
