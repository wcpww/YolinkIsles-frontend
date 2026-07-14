import { create } from 'zustand';

interface BookmarkFilterStore {
  selectedTags: Set<string>;
  toggleTag: (tagId: string) => void;
  clearTags: () => void;
}

export const useBookmarkFilterStore = create<BookmarkFilterStore>((set) => ({
  selectedTags: new Set(),
  toggleTag: (tagId) =>
    set((state) => {
      const next = new Set(state.selectedTags);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return { selectedTags: next };
    }),
  clearTags: () => set({ selectedTags: new Set() }),
}));
