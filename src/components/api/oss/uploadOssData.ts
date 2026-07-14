import { axiosInstance } from '@/api/axiosInstance';

interface OssUploadSignatureResponse {
  code: number;
  message: string;
  data: OssSignature;
}

interface OssSignature {
  dir: string;
  host: string;
  policy: string;
  signature: string;
  ossAccessKeyId?: string;
  accessKeyId?: string;
  // 兼容后端可能仍返回的旧字段
  x_oss_credential?: string;
  x_oss_date?: string;
  x_oss_signature_version?: string;
  security_token?: string;
  x_oss_security_token?: string;
}

interface UploadResult {
  key: string;
  url: string;
}

export const getOssUploadSignature = async (): Promise<OssUploadSignatureResponse['data']> => {
  const response = await axiosInstance.get<OssUploadSignatureResponse>('/get_post_signature_for_oss_upload');

  return response.data.data;
};

export const getOssUploadSignatureDev = async (): Promise<OssUploadSignatureResponse['data']> => {
  const response = await fetch('http://localhost:8080/get_post_signature_for_oss_upload', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('获取 OSS 签名失败');
  }

  const json: OssSignature = await response.json();
  console.log('📤 获取 OSS 签名响应:', json);
  return json;
};

/**
 * 清理 host URL，处理短链接、空格、反引号等问题
 */
function cleanHostUrl(host: string): string {
  let url = host.trim().replace(/`/g, '').replace(/"/g, '').replace(/'/g, '');

  // 处理短链接：提取 target 参数中的实际 URL
  if (url.includes('link.wtturl.cn') || url.includes('target=')) {
    try {
      const urlObj = new URL(url);
      const target = urlObj.searchParams.get('target');
      if (target) {
        url = decodeURIComponent(target);
      }
    } catch {
      const match = url.match(/target=([^&]+)/);
      if (match) {
        url = decodeURIComponent(match[1]);
      }
    }
  }

  if (!url.startsWith('http')) {
    url = `http://${url}`;
  }

  return url;
}

/**
 * 拼接对象 Key，避免双斜杠
 */
function buildObjectKey(dir: string, dirName: string, fileName: string, timestamp: number): string {
  const cleanDir = dir.replace(/^\/+|\/+$/g, '');
  const cleanDirName = dirName.replace(/^\/+|\/+$/g, '');

  return `${cleanDir}/${cleanDirName}/${fileName}${timestamp}`;
}

export async function uploadOssData(file: File, dirName: string): Promise<UploadResult> {
  const signature = await getOssUploadSignature();
  const timestamp = new Date().getTime();

  if (!signature) {
    throw new Error('获取 OSS 签名失败');
  }

  console.log('📤 OSS 签名信息:', JSON.stringify(signature, null, 2));

  // 构建对象 Key（避免双斜杠）
  const key = buildObjectKey(signature.dir, dirName, file.name, timestamp);

  // 清理 host URL
  const host = cleanHostUrl(signature.host);

  console.log('🚀 上传目标:', host);
  console.log('📦 上传文件:', file.name, file.size, file.type);
  console.log('🔑 对象 Key:', key);

  const formData = new FormData();

  // V2 Post Policy 表单上传字段
  formData.append('policy', signature.policy);
  formData.append('OSSAccessKeyId', signature.ossAccessKeyId || signature.accessKeyId || '');
  formData.append('signature', signature.signature);
  formData.append('key', key);
  formData.append('success_action_status', '200');

  // 安全令牌（仅在有值时添加）
  const securityToken = signature.security_token || signature.x_oss_security_token;
  if (securityToken && securityToken.trim()) {
    formData.append('x-oss-security-token', securityToken.trim());
  }

  // 文件内容（必须最后添加）
  formData.append('file', file);

  const uploadResponse = await fetch(host, {
    method: 'POST',
    body: formData,
    credentials: 'omit',
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('❌ OSS 上传失败详情:', {
      status: uploadResponse.status,
      statusText: uploadResponse.statusText,
      response: errorText,
    });
    throw new Error(`OSS 上传失败: ${uploadResponse.status} ${uploadResponse.statusText}`);
  }

  return {
    key,
    url: `${host}/${key}`,
  };
}

export default uploadOssData;