import { Send, AlertCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import uploadOssData from '@/components/api/oss/uploadOssData';
import { base64ToFile } from '../utils/base64ToFile';
import { collectImageNodes } from '../utils/extractImages';
import { replaceImageSrc } from '../utils/replaceImageSrc';
import { useCreatePost, useDraft } from '../hooks';
import SimpleTiptapEditor, { type SimpleTiptapEditorRef } from './SimpleTiptapEditor';
import TiptapEditor, { type TiptapEditorRef } from './TiptapEditor';
import TagSelector from './TagSelector';
import type { CreatePostRequest, DraftPost } from '../types';

interface CreatePostPageProps {
  draftId?: string;
}

interface LegacyDraftImage {
  imageUrl?: string;
}

export default function CreatePostPage({ draftId }: CreatePostPageProps) {
  const editorRef = useRef<TiptapEditorRef>(null);
  const descriptionEditorRef = useRef<SimpleTiptapEditorRef>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [heroUrl, setHeroUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const imageFileRef = useRef<File | null>(null);

  const TEMP_IMAGE_URL = 'https://picsum.photos/seed/yolink-post/1200/630';

  // 加载草稿
  const { draft } = useDraft(draftId);

  useEffect(() => {
    if (draft) {
      const legacyImageUrl = (draft as LegacyDraftImage).imageUrl || '';
      setTitle(draft.title);
      setTags(draft.tags);
      setHeroUrl(draft.heroUrl || legacyImageUrl);
      setThumbnailUrl(draft.thumbnailUrl || legacyImageUrl);
      if (editorRef.current && draft.contentJson) {
        editorRef.current.setContent(draft.contentJson);
      }
      if (descriptionEditorRef.current && draft.description) {
        descriptionEditorRef.current.setContent(draft.description);
      }
    }
  }, [draft]);

  // 创建文章 mutation
  const createPostMutation = useCreatePost();

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 验证文件大小（最多 10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return;
    }

    imageFileRef.current = file;
    const previewUrl = URL.createObjectURL(file);
    setHeroUrl(previewUrl);
    setThumbnailUrl(previewUrl);
    setError('');

    // 重置 input 以便可以再次选择同一文件
    e.target.value = '';
  };

  // 保存草稿到本地
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setError('请输入文章标题');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setIsSavingDraft(true);
      const contentJson = editorRef.current?.getJSON() || {};
      const descriptionHtml = descriptionEditorRef.current?.getHTML() || '';
      // 移除HTML标签，只保留文本
      const descriptionText = descriptionHtml.replace(/<[^>]*>/g, '').trim();

      const draftData: Omit<DraftPost, 'id'> = {
        title,
        description: descriptionText,
        contentJson,
        tags,
        heroUrl: heroUrl || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        savedAt: Date.now(),
      };

      // 保存到 localStorage
      const currentDraftId = localStorage.getItem('current_draft_id') || `draft_${Date.now()}`;
      localStorage.setItem(
        `draft_${currentDraftId}`,
        JSON.stringify({ id: currentDraftId, ...draftData }),
      );
      localStorage.setItem('current_draft_id', currentDraftId);

      setSuccess('草稿已保存');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('草稿保存失败');
      setTimeout(() => setError(''), 3000);
      console.error('Draft save error:', err);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // 发布文章
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证表单
    if (!title.trim()) {
      setError('请输入文章标题');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const descriptionHtml = descriptionEditorRef.current?.getHTML() || '';
    const descriptionText = descriptionHtml.replace(/<[^>]*>/g, '').trim();

    if (!descriptionText) {
      setError('请输入文章描述');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (tags.length === 0) {
      setError('至少需要添加一个标签');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const contentJson = editorRef.current?.getJSON();
    if (!contentJson || Object.keys(contentJson).length === 0) {
      setError('请输入文章内容');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // 处理编辑器内 + 封面图片
    setIsUploadingImages(true);
    try {
      // 收集编辑器内所有图片（已去重）
      const images = collectImageNodes(contentJson);
      const toUpload = images.filter(
        (img) => img.src.startsWith('data:') || img.src.startsWith('http'),
      );

      // 并行上传到 OSS
      let failedCount = 0;
      if (toUpload.length > 0) {
        const results = await Promise.allSettled(
          toUpload.map((img) =>
            (async () => {
              const file = img.src.startsWith('data:')
                ? base64ToFile(img.src, `editor_${Date.now()}`)
                : await fetch(img.src)
                    .then((r) => r.blob())
                    .then((b) => new File([b], 'image.jpg', { type: b.type || 'image/jpeg' }));
              const { key } = await uploadOssData(file, '/editor');
              replaceImageSrc(contentJson, img.path, key);
            })(),
          ),
        );

        failedCount = results.filter((r) => r.status === 'rejected').length;
        if (failedCount > 0) {
          toast.warning(`${failedCount} 张图片上传失败`);
        }
      }

      // 上传封面 / 缩略图
      let uploadedHeroUrl: string | undefined;
      if (imageFileRef.current) {
        const { key } = await uploadOssData(imageFileRef.current, '/hero');
        uploadedHeroUrl = key;
        imageFileRef.current = null;
      }

      const postData: CreatePostRequest = {
        title: title.trim(),
        description: descriptionText,
        contentJson: contentJson,
        tags,
        heroUrl: uploadedHeroUrl || undefined,
        thumbnailUrl: uploadedHeroUrl || undefined,
      };

      await createPostMutation.mutateAsync(postData);
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setIsUploadingImages(false);
    }
  };

  return (
    <div className="bg-background min-h-screen w-full">
      {/* 错误和成功提示 - 固定定位，不占用页面空间 */}
      {error && (
        <div className="animate-in slide-in-from-top fixed top-6 left-1/2 z-50 flex max-w-md -translate-x-1/2 gap-3 rounded-lg border border-red-500/30 bg-red-500/20 p-4 text-red-600">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="animate-in slide-in-from-top fixed top-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-lg border border-green-500/30 bg-green-500/20 p-4 text-green-600">
          {success}
        </div>
      )}

      <form onSubmit={handlePublish} className="mx-auto flex w-full max-w-3xl flex-col p-6 md:p-8">
        {/* Obsidian 风格标题 - H1 加粗 */}
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入文章标题..."
          className="placeholder:text-muted-foreground mb-8 bg-transparent text-5xl font-bold outline-none"
        />

        {/* 标签 */}
        <div className="mb-6">
          <TagSelector selectedTags={tags} onTagsChange={setTags} />
        </div>

        {/* 描述/摘要 */}
        <div className="border-border bg-muted/30 mb-6 rounded-lg border p-4">
          <SimpleTiptapEditor
            ref={descriptionEditorRef}
            placeholder=""
            className="min-h-12 px-0 text-base"
          />
        </div>

        {/* 编辑器 */}
        <div className="border-border bg-muted/30 mb-6 min-h-96 rounded-lg border">
          <TiptapEditor ref={editorRef} />
        </div>

        {/* 图片上传 */}
        <div className="mb-8">
          <div
            className="border-border bg-muted/50 hover:bg-muted cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors"
            onClick={() => imageInputRef.current?.click()}
          >
            {heroUrl || thumbnailUrl ? (
              <div className="flex flex-col items-center gap-2">
                <img src={heroUrl || thumbnailUrl} alt="preview" className="max-h-40 rounded" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeroUrl('');
                    setThumbnailUrl('');
                  }}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  删除图片
                </button>
              </div>
            ) : (
              <div className="text-muted-foreground">
                <p className="text-sm">点击选择图片</p>
              </div>
            )}
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* 操作按钮 */}
        <div className="sticky bottom-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || createPostMutation.isPending}
          >
            {isSavingDraft ? '保存中...' : '保存草稿'}
          </Button>
          <Button
            type="submit"
            disabled={createPostMutation.isPending || isUploadingImages}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isUploadingImages ? '图片上传中...' : createPostMutation.isPending ? '发布中...' : '发布'}
          </Button>
        </div>
      </form>
    </div>
  );
}
