import { useCallback, useEffect, useState } from 'react';
import type { DraftPost } from '../types';

const DRAFT_PREFIX = 'draft_';
const CURRENT_DRAFT_KEY = 'current_draft_id';

/**
 * 本地草稿管理 hook
 * 支持：加载草稿、保存草稿、删除草稿、列出所有草稿
 *
 * @param draftId - 草稿ID，如果不提供则为新建草稿
 * @returns 草稿对象和操作函数
 *
 * @example
 * ```typescript
 * const { draft, saveDraft, deleteDraft } = useDraft('draft_123');
 *
 * // 保存草稿
 * saveDraft({
 *   title: "标题",
 *   description: "描述",
 *   contentJson: {...},
 *   tags: [],
 *   savedAt: Date.now()
 * });
 *
 * // 加载草稿
 * useEffect(() => {
 *   loadDraft();
 * }, [loadDraft]);
 * ```
 */
export const useDraft = (draftId?: string) => {
  const [draft, setDraft] = useState<DraftPost | null>(null);

  // 加载草稿
  const loadDraft = useCallback(
    (id?: string) => {
      const targetId = id || draftId || localStorage.getItem(CURRENT_DRAFT_KEY);
      if (!targetId) return;

      const stored = localStorage.getItem(`${DRAFT_PREFIX}${targetId}`);
      if (stored) {
        try {
          setDraft(JSON.parse(stored));
        } catch (error) {
          console.error('草稿加载失败:', error);
        }
      }
    },
    [draftId],
  );

  // 保存草稿
  const saveDraft = useCallback(
    (data: Omit<DraftPost, 'id'>) => {
      const id = draftId || data.id || `draft_${Date.now()}`;
      const fullDraft: DraftPost = { ...data, id };

      try {
        localStorage.setItem(`${DRAFT_PREFIX}${id}`, JSON.stringify(fullDraft));
        localStorage.setItem(CURRENT_DRAFT_KEY, id);
        setDraft(fullDraft);
        return id;
      } catch (error) {
        console.error('草稿保存失败:', error);
        return null;
      }
    },
    [draftId],
  );

  // 删除草稿
  const deleteDraft = useCallback(
    (id?: string) => {
      const targetId = id || draftId;
      if (!targetId) return;

      try {
        localStorage.removeItem(`${DRAFT_PREFIX}${targetId}`);
        if (localStorage.getItem(CURRENT_DRAFT_KEY) === targetId) {
          localStorage.removeItem(CURRENT_DRAFT_KEY);
        }
        if (!id) {
          setDraft(null);
        }
      } catch (error) {
        console.error('草稿删除失败:', error);
      }
    },
    [draftId],
  );

  // 列出所有草稿
  const listDrafts = useCallback((): DraftPost[] => {
    const drafts: DraftPost[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(DRAFT_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            drafts.push(JSON.parse(stored));
          }
        }
      }
      return drafts.sort((a, b) => b.savedAt - a.savedAt);
    } catch (error) {
      console.error('草稿列表获取失败:', error);
      return [];
    }
  }, []);

  // 挂载时加载草稿
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  return {
    draft,
    saveDraft,
    deleteDraft,
    loadDraft,
    listDrafts,
  };
};
