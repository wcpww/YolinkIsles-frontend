import { Upload, X, ImageIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ImageUploadButtonProps {
  label?: string;
  onImageSelected?: (file: File, dataUrl: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  className?: string;
  value?: string;
  onChange?: (url: string) => void;
}

/**
 * 图片上传组件
 * 支持选择本地图片、预览、删除
 * 可选：上传到服务器或对象存储
 */
export default function ImageUploadButton({
  label = '上传图片',
  onImageSelected,
  onImageUpload,
  className = '',
  value,
  onChange,
}: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(value || '');
  const [error, setError] = useState<string>('');

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择有效的图片文件');
      return;
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB');
      return;
    }

    try {
      // 生成预览 Base64
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 调用外部 onImageSelected 回调（用于实时预览）
      if (onImageSelected) {
        onImageSelected(file, dataUrl);
      }

      // 如果提供了上传函数，执行上传
      if (onImageUpload) {
        setIsLoading(true);
        try {
          const uploadedUrl = await onImageUpload(file);
          setImageUrl(uploadedUrl);
          onChange?.(uploadedUrl);
        } catch (uploadError) {
          setError('图片上传失败');
          console.error('Upload error:', uploadError);
          // 降级到 Base64
          setImageUrl(dataUrl);
          onChange?.(dataUrl);
        } finally {
          setIsLoading(false);
        }
      } else {
        // 没有上传函数，直接使用 Base64
        setImageUrl(dataUrl);
        onChange?.(dataUrl);
      }
    } catch (err) {
      setError('图片处理失败');
      console.error('File processing error:', err);
    }

    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setImageUrl('');
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* 上传按钮 */}
      <Button
        type="button"
        variant="outline"
        onClick={handleFileClick}
        disabled={isLoading}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {isLoading ? '上传中...' : label}
      </Button>

      {/* 错误提示 */}
      {error && <div className="text-sm text-red-500">{error}</div>}

      {/* 图片预览 */}
      {imageUrl && (
        <div className="relative inline-block">
          {/* Skeleton */}
          {isLoading && <Skeleton className="absolute inset-0 h-40 w-40 rounded-lg" />}

          <div className="bg-muted relative h-40 w-40 overflow-hidden rounded-lg border">
            <img
              src={imageUrl}
              alt="Preview"
              className={cn('h-full w-full object-cover', isLoading ? 'opacity-50' : 'opacity-100')}
            />

            {/* 删除按钮 */}
            <button
              type="button"
              onClick={handleRemove}
              className="bg-foreground/80 hover:bg-foreground text-background absolute top-1 right-1 rounded-full p-1 transition-colors"
              title="删除图片"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {!imageUrl && (
        <div className="bg-muted/50 rounded-lg border-2 border-dashed p-8 text-center">
          <ImageIcon className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
          <p className="text-muted-foreground text-sm">点击上方按钮选择图片</p>
          <p className="text-muted-foreground mt-1 text-xs">支持 JPG, PNG, GIF 等格式，最大 10MB</p>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
