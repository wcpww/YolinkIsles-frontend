import { Check, Hash, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useSearchTags } from '@/features/search/hooks/useSearchTags';
import type { Tag } from '@/features/search/types';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  maxTagLength?: number;
}

export default function TagSelector({
  selectedTags,
  onTagsChange,
  maxTags = 10,
  maxTagLength = 10,
}: TagSelectorProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: matchedTags = [], isLoading: isSearching } = useSearchTags(
    input,
    'numPosts',
    showDropdown && input.length > 0,
  );

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;

    setError('');

    if (trimmed.length > maxTagLength) {
      setError(`标签不能超过 ${maxTagLength} 个字符`);
      return;
    }

    if (selectedTags.includes(trimmed)) {
      setError('该标签已存在');
      return;
    }

    if (selectedTags.length >= maxTags) {
      setError(`最多只能添加 ${maxTags} 个标签`);
      return;
    }

    onTagsChange([...selectedTags, trimmed]);
    setInput('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag));
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (matchedTags.length > 0 && input.length > 0) {
        addTag(matchedTags[0].tagName);
      } else {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && input === '' && selectedTags.length > 0) {
      e.preventDefault();
      onTagsChange(selectedTags.slice(0, -1));
      setError('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowDropdown(true);
    setError('');
  };

  // 过滤掉已选中的标签
  const filteredMatchedTags = matchedTags.filter(
    (tag) => !selectedTags.includes(tag.tagName),
  );

  return (
    <div ref={containerRef} className="relative">
      <div className="border-border flex flex-wrap items-center gap-2 border-b pb-3">
        {selectedTags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 rounded-md">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:opacity-75"
            >
              <span className="sr-only">移除标签</span>
              ×
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          placeholder={selectedTags.length === 0 ? '标签（空格分隔或选择已有标签）' : '继续输入...'}
          value={input}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="placeholder:text-muted-foreground min-w-32 flex-1 bg-transparent text-base outline-none"
        />
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {!error && selectedTags.length > 0 && (
        <p className="text-muted-foreground mt-2 text-xs">{selectedTags.length} / {maxTags} 标签</p>
      )}

      {showDropdown && input.length > 0 && (
        <div className="bg-popover absolute z-50 mt-1 w-full rounded-md border p-1 shadow-md">
          {isSearching ? (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-3 text-sm">
              <Loader2 className="size-4 animate-spin" />
              搜索中...
            </div>
          ) : filteredMatchedTags.length === 0 ? (
            <div className="text-muted-foreground py-3 text-center text-sm">
              按空格/回车添加新标签 "{input}"
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {filteredMatchedTags.slice(0, 5).map((tag) => (
                <button
                  key={tag.tagId}
                  type="button"
                  onClick={() => addTag(tag.tagName)}
                  className="hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Hash className="text-muted-foreground size-3.5" />
                    <span>{tag.tagName}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {tag.numTagPosts ?? 0} 篇文章
                  </span>
                </button>
              ))}
              {!selectedTags.includes(input.trim()) && input.trim() && (
                <button
                  type="button"
                  onClick={() => addTag(input)}
                  className="hover:bg-accent hover:text-accent-foreground text-muted-foreground flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm"
                >
                  <Check className="size-3.5" />
                  按回车添加 "{input.trim()}"
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}