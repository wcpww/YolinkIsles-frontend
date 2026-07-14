import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import type { PostCardData } from '@/features/profile/types';
import { cn } from '@/lib/utils';

interface PostImageCardProps {
  post: PostCardData;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

// Helper function to parse date string in format "YYYY-MM-DD HH:MM:SS"
function parseDate(dateString: string): string {
  try {
    // Try ISO format first (standard)
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }

    // Fall back to parsing "YYYY-MM-DD HH:MM:SS" format
    const [datePart] = dateString.split(' ');
    const parsedDate = new Date(datePart);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString();
    }

    // If all parsing fails, return the original string
    return dateString;
  } catch {
    return dateString;
  }
}

export function PostImageCard({ post, size = 'md', onClick, className }: PostImageCardProps) {
  const sizeClasses = {
    sm: 'h-40 w-full',
    md: 'h-60 w-full',
    lg: 'h-80 w-full',
  };

  return (
    <div
      data-slot="post-image-card"
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg',
        sizeClasses[size],
        className,
      )}
      onClick={onClick}
    >
      {/* Background Image */}
      {post.imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{
            backgroundImage: `url(${getSrcPath(post.imageUrl, OSS_STYLE_PARAMETERS.THUMBNAIL)})`,
          }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-start justify-end p-4 text-white">
        <h3 className="mb-2 line-clamp-2 text-lg leading-snug font-bold md:text-xl">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 text-sm opacity-90">
          <span>{post.author}</span>
          <span>•</span>
          <span>{parseDate(post.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default PostImageCard;
