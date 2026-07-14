export interface ImageNode {
  /** 在 Tiptap JSON 树中的路径，用于后续替换 */
  path: (string | number)[];
  /** 当前图片 src */
  src: string;
}

/**
 * 递归遍历 Tiptap JSON，收集所有图片节点
 * 自动去重：相同 src 只保留一个
 */
export function collectImageNodes(
  node: unknown,
  path: (string | number)[] = [],
  seen = new Set<string>(),
): ImageNode[] {
  if (!node || typeof node !== 'object') return [];

  const results: ImageNode[] = [];

  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      results.push(...collectImageNodes(node[i], [...path, i], seen));
    }
    return results;
  }

  const obj = node as Record<string, unknown>;

  if (obj.type === 'image' && obj.attrs && typeof obj.attrs === 'object') {
    const src = (obj.attrs as Record<string, unknown>).src as string | undefined;
    if (src && !seen.has(src)) {
      seen.add(src);
      results.push({ path, src });
    }
  }

  for (const key of Object.keys(obj)) {
    results.push(...collectImageNodes(obj[key], [...path, key], seen));
  }

  return results;
}
