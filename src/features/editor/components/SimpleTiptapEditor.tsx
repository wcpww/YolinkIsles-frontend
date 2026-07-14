import Placeholder from '@tiptap/extension-placeholder';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useImperativeHandle, forwardRef } from 'react';
import './SimpleTiptapEditor.css';

export interface SimpleTiptapEditorRef {
  getJSON: () => object;
  getHTML: () => string;
  setContent: (content: string) => void;
  clear: () => void;
}

interface SimpleTiptapEditorProps {
  placeholder?: string;
  className?: string;
}

/**
 * 最简 TipTap 编辑器
 * 仅支持基本文本输入，无工具栏和样式功能
 */
const SimpleTiptapEditor = forwardRef<SimpleTiptapEditorRef, SimpleTiptapEditorProps>(
  ({ placeholder = '输入内容...', className = '' }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          // 仅保留基本段落，禁用其他块级元素和标记
          heading: false,
          codeBlock: false,
          blockquote: false,
          horizontalRule: false,
          bulletList: false,
          orderedList: false,
        }),
        Placeholder.configure({
          placeholder: placeholder,
          emptyNodeClass: 'is-editor-empty',
        }),
      ],
      content: '<p></p>',
      editorProps: {
        attributes: {
          class: `outline-none text-foreground bg-transparent ${className}`,
        },
      },
    });

    // 导出 ref 方法
    useImperativeHandle(ref, () => ({
      getJSON: () => editor?.getJSON() || {},
      getHTML: () => editor?.getHTML() || '',
      setContent: (content: string) => {
        editor?.commands.setContent(content);
      },
      clear: () => {
        editor?.commands.clearContent();
      },
    }));

    if (!editor) {
      return null;
    }

    return (
      <div className="simple-editor-wrapper">
        <EditorContent editor={editor} />
      </div>
    );
  },
);

SimpleTiptapEditor.displayName = 'SimpleTiptapEditor';

export default SimpleTiptapEditor;
