import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TiptapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  Image,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  CodeXml,
} from 'lucide-react';
import { useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import './TiptapEditor.css';

// 初始化 lowlight
const lowlight = createLowlight(common);

export interface TiptapEditorRef {
  getJSON: () => object;
  getHTML: () => string;
  setContent: (content: object) => void;
  clear: () => void;
}

interface TiptapEditorProps {
  onImageUpload?: (file: File) => Promise<string>;
  className?: string;
}

/**
 * TipTap 富文本编辑器组件
 * 支持基础文本格式化、列表、链接、图片等功能
 * 通过 ref 可获取编辑器内容的 JSON 和 Markdown 格式
 */
const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  ({ onImageUpload, className = '' }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          bulletList: {
            keepMarks: true,
          },
          orderedList: {
            keepMarks: true,
          },
          codeBlock: false,
        }),
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class: 'language-plaintext',
          },
        }),
        TiptapImage.configure({
          allowBase64: true,
          HTMLAttributes: {
            class: 'editor-image max-w-2xl',
          },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-500 underline cursor-pointer',
          },
        }),
      ],
      content: '<p></p>',
      editorProps: {
        attributes: {
          class:
            'prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4 min-h-96 text-foreground',
        },
      },
    });

    const toolbarState = useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => ({
        isBold: currentEditor.isActive('bold'),
        isItalic: currentEditor.isActive('italic'),
        isCode: currentEditor.isActive('code'),
        isCodeBlock: currentEditor.isActive('codeBlock'),
        isHeading1: currentEditor.isActive('heading', { level: 1 }),
        isHeading2: currentEditor.isActive('heading', { level: 2 }),
        isHeading3: currentEditor.isActive('heading', { level: 3 }),
        isBulletList: currentEditor.isActive('bulletList'),
        isOrderedList: currentEditor.isActive('orderedList'),
        isBlockquote: currentEditor.isActive('blockquote'),
        isLink: currentEditor.isActive('link'),
        canUndo: currentEditor.can().undo(),
        canRedo: currentEditor.can().redo(),
      }),
    }) ?? {
      isBold: false,
      isItalic: false,
      isCode: false,
      isCodeBlock: false,
      isHeading1: false,
      isHeading2: false,
      isHeading3: false,
      isBulletList: false,
      isOrderedList: false,
      isBlockquote: false,
      isLink: false,
      canUndo: false,
      canRedo: false,
    };

    // 导出 ref 方法
    useImperativeHandle(ref, () => ({
      getJSON: () => editor?.getJSON() || {},
      getHTML: () => editor?.getHTML() || '',
      setContent: (content: object) => {
        editor?.commands.setContent(content);
      },
      clear: () => {
        editor?.commands.clearContent();
      },
    }));

    // 工具栏按钮操作
    const handleBold = () => editor?.chain().focus().toggleBold().run();
    const handleItalic = () => editor?.chain().focus().toggleItalic().run();
    const handleCode = () => editor?.chain().focus().toggleCode().run();
    const handleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run();
    const handleH1 = () => editor?.chain().focus().toggleHeading({ level: 1 }).run();
    const handleH2 = () => editor?.chain().focus().toggleHeading({ level: 2 }).run();
    const handleH3 = () => editor?.chain().focus().toggleHeading({ level: 3 }).run();
    const handleBulletList = () => editor?.chain().focus().toggleBulletList().run();
    const handleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
    const handleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();
    const handleUndo = () => editor?.chain().focus().undo().run();
    const handleRedo = () => editor?.chain().focus().redo().run();

    // 工具栏按钮样式辅助函数
    const getToolbarButtonClass = (isActive: boolean) => {
      return isActive ? 'border border-muted bg-muted' : 'border border-muted bg-transparent';
    };

    const handleAddLink = useCallback(() => {
      const url = prompt('输入链接地址:');
      if (url) {
        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
    }, [editor]);

    const handleAddImage = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleImageSelected = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
          let src: string;

          if (onImageUpload) {
            // 使用自定义上传函数（如OSS）
            src = await onImageUpload(file);
          } else {
            // 默认：转换为 Base64
            src = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                resolve(event.target?.result as string);
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          }

          editor?.chain().focus().setImage({ src }).run();
        } catch (error) {
          console.error('图片插入失败:', error);
          // TODO: 显示错误提示
        }

        // 重置 input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      [editor, onImageUpload],
    );

    if (!editor) {
      return <div className="text-muted-foreground p-4">编辑器加载中...</div>;
    }

    return (
      <div className={`bg-card overflow-hidden rounded-lg border ${className}`}>
        {/* 工具栏 */}
        <div className="bg-muted/50 flex flex-wrap items-center gap-1 border-b p-2">
          {/* 文本格式 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBold}
            title="粗体 (Ctrl+B)"
            className={getToolbarButtonClass(toolbarState.isBold)}
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleItalic}
            title="斜体 (Ctrl+I)"
            className={getToolbarButtonClass(toolbarState.isItalic)}
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCode}
            title="代码"
            className={getToolbarButtonClass(toolbarState.isCode)}
          >
            <Code className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCodeBlock}
            title="代码块"
            className={getToolbarButtonClass(toolbarState.isCodeBlock)}
          >
            <CodeXml className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* 标题 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleH1}
            title="标题 1"
            className={getToolbarButtonClass(toolbarState.isHeading1)}
          >
            <Heading1 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleH2}
            title="标题 2"
            className={getToolbarButtonClass(toolbarState.isHeading2)}
          >
            <Heading2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleH3}
            title="标题 3"
            className={getToolbarButtonClass(toolbarState.isHeading3)}
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* 列表 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBulletList}
            title="无序列表"
            className={getToolbarButtonClass(toolbarState.isBulletList)}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleOrderedList}
            title="有序列表"
            className={getToolbarButtonClass(toolbarState.isOrderedList)}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* 块级元素 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBlockquote}
            title="引用"
            className={getToolbarButtonClass(toolbarState.isBlockquote)}
          >
            <Quote className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* 媒体和链接 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddLink}
            title="添加链接"
            className={getToolbarButtonClass(toolbarState.isLink)}
          >
            <Link2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddImage}
            title="插入图片"
            className="border-muted border"
          >
            <Image className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* 撤销重做 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!toolbarState.canUndo}
            title="撤销 (Ctrl+Z)"
            className="border-muted border"
          >
            <Undo2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!toolbarState.canRedo}
            title="重做 (Ctrl+Y)"
            className="border-muted border"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        {/* 编辑器 */}
        <div className="p-4">
          <EditorContent editor={editor} className="prose-editor" />
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelected}
          className="hidden"
        />
      </div>
    );
  },
);

TiptapEditor.displayName = 'TiptapEditor';

export default TiptapEditor;
