const OSS_PATH = import.meta.env.VITE_DEV_OSS_PATH as string;
const STYLE_PARAM = import.meta.env.VITE_DEV_OSS_STYLE_PARAMETERS as string;

/*
 * 样式参数枚举量
 * 这里定义了几个常用的样式参数，可以根据实际需要进行扩展
 */
export const OSS_STYLE_PARAMETERS = {
  HERO: 'hero', // 生成适合做封面图的图片
  THUMBNAIL: 'thumbnail', // 生成缩略图，适用于列表页展示，800px宽
  CARD: 'card', // 生成中等尺寸图片，适用于详情页展示，400px宽
  AVATAR: 'avatar', // 生成适合做头像的图片，200px宽
  TINY: 'tiny', // 生成小尺寸头像，100px宽
  // 可以根据OSS的图片处理功能添加更多样式参数
} as const;

/*
 * 获取OSS资源的完整URL路径
 * @param relativePath - 相对于OSS根路径的资源路径，例如 "pic/pic1.jpg"
 * @param styleName - 可选的样式名称，用于指定图片处理样式，例如 "style1"
 * @returns 资源的完整URL路径，例如 "https://yolink-dev.oss-cn-beijing.aliyuncs.com/pic/pic1.jpg?x-oss-process=thumbnail"
 */
export function getSrcPath(relativePath: string, styleName?: string): string {
  // relativePath: "pic/pic1.jpg"
  const path = styleName ? `${relativePath}?${STYLE_PARAM}=${styleName}` : relativePath;
  return `${OSS_PATH}${path}`;
}

/*
 * 用法：
 * import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
 * const imageUrl = getSrcPath('pic/pic1.jpg', OSS_STYLE_PARAMETERS.THUMBNAIL);
 * 这样就会生成一个适合做缩略图的图片URL，宽度为800px。
 */
