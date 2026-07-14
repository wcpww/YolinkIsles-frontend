/**
 * base64 data URL → File 对象（用于 OSS 上传）
 *
 * @param dataUrl - 完整的 data URL，如 "data:image/png;base64,iVBORw0KG..."
 * @param filename - 文件名（不含扩展名）
 */
export function base64ToFile(dataUrl: string, filename: string): File {
  const [meta, base64] = dataUrl.split(',');
  const mimeMatch = meta.match(/:(.*?);/);
  const mimeType = mimeMatch?.[1] || 'image/png';
  const extension = mimeType.split('/')[1] || 'png';

  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  return new File([byteArray], `${filename}.${extension}`, { type: mimeType });
}
