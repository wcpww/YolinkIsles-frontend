import { SearchPostResult } from '../components/SearchPostResult';
import { SearchTagResult } from '../components/SearchTagResult';
import { SearchUserResult } from '../components/SearchUserResult';

interface SearchPageProps {
  keyword: string;
  type: string;
  aim: string;
  onSearch: (keyword: string) => void;
  onTypeChange: (type: string) => void;
}

export default function SearchPage({
  keyword,
  type,
  aim,
  onSearch,
  onTypeChange,
}: SearchPageProps) {
  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      {/* Search Results based on aim */}
      {aim === 'post' && (
        <SearchPostResult keyword={keyword} type={type} onTypeChange={onTypeChange} />
      )}
      {aim === 'tag' && (
        <SearchTagResult keyword={keyword} type={type} onTypeChange={onTypeChange} />
      )}
      {aim === 'user' && (
        <SearchUserResult keyword={keyword} type={type} onTypeChange={onTypeChange} />
      )}
    </div>
  );
}
