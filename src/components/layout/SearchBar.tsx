'use client';

import { useNavigate } from '@tanstack/react-router';
import { ChevronDownIcon, Search } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';

type SearchType = 'post' | 'user' | 'tag';

interface SearchBarProps {
  className?: string;
}

export const SearchBar = ({ className }: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('post');
  const navigate = useNavigate();

  // Get default type based on search aim
  const getDefaultType = (aim: SearchType): string => {
    switch (aim) {
      case 'post':
        return 'new';
      case 'user':
        return 'numFollowers';
      case 'tag':
        return 'numFollowers';
      default:
        return 'new';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      navigate({
        to: '/search',
        search: { keyword: trimmed, type: getDefaultType(searchType), aim: searchType },
      });
    }
  };

  const handleTypeChange = (newType: SearchType) => {
    setSearchType(newType);
    const trimmed = searchValue.trim();
    // If there's text in the search bar, navigate immediately with the new aim
    if (trimmed) {
      navigate({
        to: '/search',
        search: { keyword: trimmed, type: getDefaultType(newType), aim: newType },
      });
    }
  };

  const searchTypeLabels: Record<SearchType, string> = {
    post: '帖子',
    user: '用户',
    tag: '标签',
  };

  return (
    <form onSubmit={handleSearch} className={`flex justify-center ${className || ''}`}>
      <InputGroup className="bg-muted w-full max-w-xl [--radius:1.5rem]">
        <InputGroupAddon align="inline-start" className="pl-3">
          <Search className="text-muted-foreground h-4 w-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="搜索..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="border-0"
        />
        <InputGroupAddon align="inline-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton className="!pr-1.5 text-xs" variant="ghost">
                {searchTypeLabels[searchType]}
                <ChevronDownIcon className="size-3" />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="[--radius:0.95rem]">
              <DropdownMenuItem onClick={() => handleTypeChange('post')}>帖子</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeChange('user')}>用户</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeChange('tag')}>标签</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
};
