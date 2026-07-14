# MarkdownDisplay 组件

`MarkdownDisplay` 是一个用于渲染 TipTap 编辑器 JSON 输出的 React 组件。

## 使用方法

### 基础使用

```tsx
import { MarkdownDisplay } from '@/features/post-detail/components/MarkdownDisplay';

const jsonContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Hello World'
        }
      ]
    }
  ]
};

export function MyComponent() {
  return <MarkdownDisplay json={jsonContent} />;
}
```

## 支持的节点类型

### 块级节点 (Block Nodes)

| 节点类型 | 说明 | 属性示例 |
|---------|------|--------|
| `doc` | 文档根节点 | - |
| `paragraph` | 段落 | - |
| `heading` | 标题 (h1-h6) | `level: 1-6` |
| `blockquote` | 引用块 | - |
| `codeBlock` | 代码块 | `language: 'javascript'` |
| `bulletList` | 无序列表 | - |
| `orderedList` | 有序列表 | `start: 1` |
| `listItem` | 列表项 | - |
| `table` | 表格 | - |
| `tableRow` | 表格行 | - |
| `tableCell` | 表格单元格 | `colspan, rowspan` |
| `tableHeader` | 表格表头 | `colspan, rowspan` |
| `horizontalRule` | 水平线 | - |
| `image` | 图片 | `src, alt, title` |

### 内联节点 (Inline Nodes)

| 节点类型 | 说明 |
|---------|------|
| `text` | 文本 |
| `hardBreak` | 换行符 |

### 标记 (Marks)

| 标记类型 | 说明 | 属性示例 |
|---------|------|--------|
| `bold` | 粗体 | - |
| `italic` | 斜体 | - |
| `code` | 代码 | - |
| `link` | 链接 | `href, target, rel` |
| `strikethrough` | 删除线 | - |
| `underline` | 下划线 | - |
| `highlight` | 高亮 | - |

## JSON 结构示例

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": {
        "level": 1
      },
      "content": [
        {
          "type": "text",
          "text": "标题"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "普通文本 "
        },
        {
          "type": "text",
          "marks": [
            {
              "type": "bold"
            }
          ],
          "text": "粗体"
        },
        {
          "type": "text",
          "text": " 和 "
        },
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "斜体"
        }
      ]
    }
  ]
}
```

## 样式定制

组件使用 Tailwind CSS 进行样式设置，包括以下类：

- `prose` 和 `prose-invert` - 基础排版样式
- 响应式设计 - `md:` 前缀用于中等及以上屏幕
- 深色模式支持 - `dark:` 前缀

如需自定义样式，可以在组件中修改相应的 Tailwind 类。

## 示例文件

详见 `mocks/tiptap-example.json` - 包含所有支持的节点类型的完整示例。

## PostDetailPage 集成

在 PostDetailPage 中的使用优先级：

1. **优先使用** `contentJson` - TipTap 编辑器的 JSON 输出
2. **降级使用** `contentMd` - Markdown 格式的备选内容
3. **最后** 显示 "No content available" 提示

```tsx
{post.contentJson ? (
  <MarkdownDisplay json={post.contentJson} />
) : post.contentMd ? (
  <div className="whitespace-pre-wrap">{post.contentMd}</div>
) : (
  <div className="text-muted-foreground">No content available.</div>
)}
```
