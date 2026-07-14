import { uploadOssData } from "@/components/api/oss/uploadOssData";

export const useOssUpload = (file: File, dirName: string) => {
  const result = async () => {
    return uploadOssData(file, dirName);
  };
  return result;
};