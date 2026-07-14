import { createFileRoute, useNavigate } from '@tanstack/react-router';
import SearchPage from '@/features/search/pages/SearchPage';

type SearchParams = {
  keyword?: string;
  type?: string;
  aim?: string;
};

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    keyword: (search.keyword as string) ?? '',
    type: (search.type as string) ?? 'relevance',
    aim: (search.aim as string) ?? 'post',
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { keyword = '', type = 'relevance', aim = 'post' } = Route.useSearch();
  const navigate = useNavigate();

  const handleSearch = (newKeyword: string) => {
    navigate({ to: '/search', search: { keyword: newKeyword, type, aim } });
  };

  const handleTypeChange = (newType: string) => {
    navigate({ to: '/search', search: { keyword, type: newType, aim } });
  };

  return (
    <SearchPage
      keyword={keyword}
      type={type}
      aim={aim}
      onSearch={handleSearch}
      onTypeChange={handleTypeChange}
    />
  );
}
