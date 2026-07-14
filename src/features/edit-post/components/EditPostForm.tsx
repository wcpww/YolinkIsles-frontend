import { Send, AlertCircle } from 'lucide-react';
import { useMemo, useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import uploadOssData from '@/components/api/oss/uploadOssData';
import TagSelector from '@/features/editor/components/TagSelector';
import { base64ToFile } from '@/features/editor/utils/base64ToFile';
import { collectImageNodes } from '@/features/editor/utils/extractImages';
import { replaceImageSrc } from '@/features/editor/utils/replaceImageSrc';
import SimpleTiptapEditor, { type SimpleTiptapEditorRef } from '@/features/editor/components/SimpleTiptapEditor';
import TiptapEditor, { type TiptapEditorRef } from '@/features/editor/components/TiptapEditor';
import { useUpdatePost } from '../hooks/useUpdatePost';
import type { PostDetailData } from '@/features/post-detail/types';

interface EditPostFormProps {
  post: PostDetailData;
}

export default function EditPostForm({ post }: EditPostFormProps) {
  const editorRef = useRef<TiptapEditorRef>(null);
  const descriptionEditorRef = useRef<SimpleTiptapEditorRef>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post.title);
  const [tags, setTags] = useState<string[]>(() =>
    post.tags?.map((t) => (typeof t === 'string' ? t : t.tagName)) ?? [],
  );
  const [heroKey, setHeroKey] = useState(post.heroKey ?? '');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [error, setError] = useState('');
  const imageFileRef = useRef<File | null>(null);

  const heroPreview = useMemo(() => {
    if (!heroKey) return '';
    if (heroKey.startsWith('blob:')) return heroKey;
    return getSrcPath(heroKey, OSS_STYLE_PARAMETERS.HERO);
  }, [heroKey]);

  const updatePostMutation = useUpdatePost(post.id);

  // Pre-fill editor content
  useEffect(() => {
    if (post.contentJson && editorRef.current) {
      editorRef.current.setContent(post.contentJson);
    }
    if (post.description && descriptionEditorRef.current) {
      descriptionEditorRef.current.setContent(post.description);
    }
  }, [post.contentJson, post.description]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return;
    }

    imageFileRef.current = file;
    const previewUrl = URL.createObjectURL(file);
    setHeroKey(previewUrl);
    setError('');
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('请输入文章标题');
      return;
    }

    const descriptionHtml = descriptionEditorRef.current?.getHTML() || '';
    const descriptionText = descriptionHtml.replace(/<[^>]*>/g, '').trim();

    if (!descriptionText) {
      setError('请输入文章描述');
      return;
    }

    if (tags.length === 0) {
      setError('至少需要添加一个标签');
      return;
    }

    const contentJson = editorRef.current?.getJSON();
    if (!contentJson || Object.keys(contentJson).length === 0) {
      setError('请输入文章内容');
      return;
    }

    setIsUploadingImages(true);
    try {
      // 处理编辑器内图片
      const images = collectImageNodes(contentJson);
      const toUpload = images.filter(
        (img) => img.src.startsWith('data:') || img.src.startsWith('http'),
      );

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
        if (failedCount > 0) toast.warning(`${failedCount} 张图片上传失败`);
      }

      // 上传封面
      let uploadedHeroUrl: string | undefined;
      if (imageFileRef.current) {
        const { key } = await uploadOssData(imageFileRef.current, '/hero');
        uploadedHeroUrl = key;
        imageFileRef.current = null;
      }

      // 构建变更字段
      const changes: Record<string, unknown> = {};
      if (title.trim() !== post.title) changes.title = title.trim();
      if (descriptionText !== post.description) changes.description = descriptionText;
      if (JSON.stringify(contentJson) !== JSON.stringify(post.contentJson))
        changes.contentJson = contentJson;
      if (JSON.stringify(tags) !== JSON.stringify(post.tags?.map((t) => (typeof t === 'string' ? t : t.tagName))))
        changes.tags = tags;
      if (uploadedHeroUrl || heroKey !== (post.heroKey ?? ''))
        changes.heroKey = uploadedHeroUrl || heroKey;
      if (uploadedHeroUrl) changes.thumbnailUrl = uploadedHeroUrl;

      await updatePostMutation.mutateAsync(changes);
      toast.success('文章已更新');
    } catch (err) {
      console.error('Update error:', err);
      toast.error('更新失败，请重试');
    } finally {
      setIsUploadingImages(false);
    }
  };

  return (
    <div className="bg-background min-h-screen w-full">
      {error && (
        <div className="animate-in slide-in-from-top fixed top-6 left-1/2 z-50 flex max-w-md -translate-x-1/2 gap-3 rounded-lg border border-red-500/30 bg-red-500/20 p-4 text-red-600">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-3xl flex-col p-6 md:p-8">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入文章标题..."
          className="placeholder:text-muted-foreground mb-8 bg-transparent text-5xl font-bold outline-none"
        />

        <div className="mb-6">
          <TagSelector selectedTags={tags} onTagsChange={setTags} />
        </div>

        <div className="border-border bg-muted/30 mb-6 rounded-lg border p-4">
          <SimpleTiptapEditor
            ref={descriptionEditorRef}
            placeholder=""
            className="min-h-12 px-0 text-base"
          />
        </div>

        <div className="border-border bg-muted/30 mb-6 min-h-96 rounded-lg border">
          <TiptapEditor ref={editorRef} />
        </div>

        <div className="mb-8">
          <div
            className="border-border bg-muted/50 hover:bg-muted cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors"
            onClick={() => imageInputRef.current?.click()}
          >
            {heroKey ? (
              <div className="flex flex-col items-center gap-2">
                <img src={heroPreview} alt="preview" className="max-h-40 rounded" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeroKey('');
                    imageFileRef.current = null;
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

        <div className="sticky bottom-6 flex justify-end gap-2">
          <Button
            type="submit"
            disabled={updatePostMutation.isPending || isUploadingImages}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isUploadingImages
              ? '图片上传中...'
              : updatePostMutation.isPending
                ? '更新中...'
                : '更新文章'}
          </Button>
        </div>
      </form>
    </div>
  );
}
