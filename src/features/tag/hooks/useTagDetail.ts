import { useQuery } from '@tanstack/react-query';
import { getTagDetail } from '../api/getTagDetail';

export const useTagDetail = (tagId: string) => {
  return useQuery({
    queryKey: ['tag-detail', tagId],
    queryFn: () => getTagDetail(tagId),
  });
};
