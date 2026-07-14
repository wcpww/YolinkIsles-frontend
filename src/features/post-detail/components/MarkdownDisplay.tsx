import hljs from 'highlight.js';
import { Check, Copy } from 'lucide-react';
import { Fragment, createElement, useState } from 'react';
import type { ReactNode } from 'react';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';

/**
 * TipTap JSON Node 类型定义
 * 支持的node: doc, paragraph, heading, blockquote, codeBlock, bulletList, orderedList, listItem, hardBreak, horizontalRule, image, table, tableRow, tableCell, tableHeader
 * 支持的mark: bold, italic, code, link, strikethrough, underline, highlight
 */
interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
  text?: string;
  attrs?: Record<string, any>;
}

interface MarkdownDisplayProps {
  json: TipTapNode | Record<string, any>;
}

function CodeBlock({ lang, codeText }: { lang: string; codeText: string }) {
  const [copied, setCopied] = useState(false);

  let highlightedHtml: string;
  try {
    highlightedHtml =
      lang && hljs.getLanguage(lang)
        ? hljs.highlight(codeText, { language: lang }).value
        : hljs.highlightAuto(codeText).value;
  } catch {
    highlightedHtml = codeText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const handleCopy = () => {
    void navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="group/codeblock relative my-4 overflow-hidden rounded-lg">
      <button
        onClick={handleCopy}
        aria-label="复制代码"
        className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/codeblock:opacity-100 hover:bg-white/20"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? '已复制' : '复制'}
      </button>
      <pre className="m-0">
        <code
          className="hljs block overflow-x-auto font-mono text-sm"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </pre>
    </div>
  );
}

/**
 * 递归渲染 TipTap 的 JSON 输出
 * 支持常见的块级元素和内联元素
 */
export function MarkdownDisplay({ json }: MarkdownDisplayProps) {
  const renderNode = (
    node: TipTapNode | Record<string, any>,
    index: number = 0,
    parentType: string = '',
  ): ReactNode => {
    const { type, content = [], marks = [], text, attrs = {} } = node as any;

    let element: ReactNode;

    // 块级元素
    switch (type) {
      case 'doc':
        return (
          <div className="prose dark:prose-invert max-w-none">
            {(content as TipTapNode[]).map((n: TipTapNode, i: number) => renderNode(n, i, 'doc'))}
          </div>
        );

      case 'paragraph':
        // 在列表项内的段落不需要外边距
        const paragraphClass = parentType === 'listItem' ? 'inline' : 'my-2';
        element = (
          <p className={paragraphClass}>
            {content.length > 0
              ? (content as TipTapNode[]).map((n: TipTapNode, i: number) =>
                  renderNode(n, i, 'paragraph'),
                )
              : text}
          </p>
        );
        break;

      case 'heading':
        const level = attrs.level || 1;
        const headingClasses: Record<number, string> = {
          1: 'scroll-mt-16 text-3xl font-bold my-4',
          2: 'scroll-mt-16 text-2xl font-bold my-3',
          3: 'scroll-mt-16 text-xl font-bold my-2',
          4: 'scroll-mt-16 text-lg font-bold my-2',
          5: 'scroll-mt-16 font-bold my-2',
          6: 'scroll-mt-16 font-semibold my-2',
        };
        const headingClass = headingClasses[level] || 'text-lg font-bold my-2';
        const headingText = (content as TipTapNode[]).map((n: any) => n.text ?? '').join('');
        const headingId = headingText
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\u4e00-\u9fa5-]/g, '');
        element = createElement(
          `h${level}` as any,
          { className: headingClass, id: headingId },
          (content as TipTapNode[]).map((n: TipTapNode, i: number) =>
            renderNode(n, i, `h${level}`),
          ),
        );
        break;

      case 'blockquote':
        element = (
          <blockquote className="my-2 border-l-4 border-gray-300 pl-4 text-gray-600 italic dark:border-gray-600 dark:text-gray-400">
            {(content as TipTapNode[]).map((n: TipTapNode, i: number) =>
              renderNode(n, i, 'blockquote'),
            )}
          </blockquote>
        );
        break;

      case 'codeBlock': {
        const attrsTyped = attrs as Record<string, unknown>;
        const lang = typeof attrsTyped.language === 'string' ? attrsTyped.language : '';
        const codeText = (content as TipTapNode[]).map((n) => n.text ?? '').join('');
        element = <CodeBlock key={index} lang={lang} codeText={codeText} />;
        break;
      }

      case 'bulletList':
        element = (
          <ul className="my-2 ml-4 list-inside list-disc">
            {(content as TipTapNode[]).map((n: TipTapNode, i: number) =>
              renderNode(n, i, 'bulletList'),
            )}
          </ul>
        );
        break;

      case 'orderedList':
        element = (
          <ol className="my-2 ml-4 list-inside list-decimal">
            {(content as TipTapNode[]).map((n: TipTapNode, i: number) =>
              renderNode(n, i, 'orderedList'),
            )}
          </ol>
        );
        break;

      case 'listItem':
        element = (
          <li className="my-1">
            {(content as TipTapNode[]).map((n: TipTapNode, i: number) =>
              renderNode(n, i, 'listItem'),
            )}
          </li>
        );
        break;

      case 'hardBreak':
        element = <br />;
        break;

      case 'horizontalRule':
        element = <hr className="my-4 border-gray-300 dark:border-gray-600" />;
        break;

      case 'image': {
        const src: string = attrs.src || '';
        const isOssKey = !src.startsWith('data:') && !src.startsWith('http');
        element = (
          <img
            src={isOssKey ? getSrcPath(src, OSS_STYLE_PARAMETERS.THUMBNAIL) : src}
            alt={attrs.alt || 'image'}
            title={attrs.title}
            className="my-2 h-auto max-w-full rounded-lg"
          />
        );
        break;
      }

      case 'table':
        element = (
          <div className="my-2 overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <tbody>
                {(content as TipTapNode[]).map((n: TipTapNode, i: number) =>
                  renderNode(n, i, 'table'),
                )}
              </tbody>
            </table>
          </div>
        );
        break;

      case 'tableRow':
        element = (
          <tr>
            {(content as TipTapNode[]).map((n: TipTapNode, i: number) =>
              renderNode(n, i, 'tableRow'),
            )}
          </tr>
        );
        break;

      case 'tableCell':
        element = (
          <td className="border border-gray-300 px-3 py-2 dark:border-gray-600">
            {(content as TipTapNode[]).map((n: TipTapNode, i: number) =>
              renderNode(n, i, 'tableCell'),
            )}
          </td>
        );
        break;

      case 'tableHeader':
        element = (
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 font-semibold dark:border-gray-600 dark:bg-gray-800">
            {(content as TipTapNode[]).map((n: TipTapNode, i: number) =>
              renderNode(n, i, 'tableHeader'),
            )}
          </th>
        );
        break;

      // 文本节点
      case 'text':
        element = <>{text}</>;
        break;

      default:
        // 未知类型，返回文本内容
        element = (
          <>
            {text ||
              (content as TipTapNode[]).map((n: TipTapNode, i: number) =>
                renderNode(n, i, 'default'),
              )}
          </>
        );
    }

    // 应用 marks（内联样式）
    if (marks && marks.length > 0 && type === 'text') {
      for (const mark of marks) {
        switch (mark.type) {
          case 'bold':
            element = <strong>{element}</strong>;
            break;
          case 'italic':
            element = <em>{element}</em>;
            break;
          case 'code':
            element = (
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-gray-900">
                {element}
              </code>
            );
            break;
          case 'link':
            element = (
              <a
                href={mark.attrs?.href}
                target={mark.attrs?.target || '_blank'}
                rel={mark.attrs?.rel || 'noopener noreferrer'}
                className="text-blue-500 hover:underline dark:text-blue-400"
              >
                {element}
              </a>
            );
            break;
          case 'strikethrough':
            element = <s>{element}</s>;
            break;
          case 'underline':
            element = <u>{element}</u>;
            break;
          case 'highlight':
            element = <mark className="bg-yellow-200 dark:bg-yellow-800">{element}</mark>;
            break;
        }
      }
    }

    return <Fragment key={index}>{element}</Fragment>;
  };

  return <>{renderNode(json)}</>;
}
