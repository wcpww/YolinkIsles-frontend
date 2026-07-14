// src/features/editor/components/NotionEditor.tsx

import '@blocknote/core/fonts/inter.css';
import { zh } from '@blocknote/core/locales';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';

export default function NotionEditor() {
  const editor = useCreateBlockNote({
    dictionary: zh,
  });
  // Renders the editor instance using a React component.
  return (
    <BlockNoteView
      editor={editor}
      shadCNComponents={
        {
          // Pass modified ShadCN components from your project here.
          // Otherwise, the default ShadCN components will be used.
        }
      }
      className="max-w-3/4 min-w-1/2"
    />
  );
}
