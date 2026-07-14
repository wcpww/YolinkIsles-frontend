// src/components/layout/AppNavbar.tsx

import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { ModeToggle } from '../theme/ModeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { SearchBar } from './SearchBar';
import { UserProfileHoverCard } from './UserProfileHoverCard';

export const AppNavbar = () => {
  const user = useAuthStore((state) => state.currentUserData);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <header className="bg-background fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b px-4 lg:px-6">
      <div className="text-primary/90 flex items-center gap-2 text-3xl font-bold tracking-tight">
        LOGO
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <SearchBar className="w-full" />
      </div>

      {/* <div className="flex items-center gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div> */}
      <ModeToggle />

      <UserProfileHoverCard
        user={user ?? undefined}
        isLoading={false}
        trigger={
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage
                src={
                  isLoggedIn && user
                    ? getSrcPath(user.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)
                    : 'https://github.com/shadcn.png'
                }
                alt={user?.username || 'User'}
              />
              <AvatarFallback>
                {isLoggedIn && user ? user.username.charAt(0).toUpperCase() : 'CN'}
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      />
    </header>
  );
};
