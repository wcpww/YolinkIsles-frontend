/**
 * 在 JSON 树中沿路径替换图片节点的 src
 * 直接修改原对象
 */
export function replaceImageSrc(json: unknown, path: (string | number)[], newSrc: string): void {
  let current: any = json;

  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]];
  }

  const last = path[path.length - 1];
  if (current && current[last]?.attrs) {
    current[last].attrs.src = newSrc;
  }
}
