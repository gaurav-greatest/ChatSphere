import { cn } from '@/utils/cn';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
}

export default function Avatar({ src, name, size = 'md', isOnline, className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const statusSizeClasses = {
    sm: 'w-2 h-2 border-[1.5px]',
    md: 'w-2.5 h-2.5 border-[2px]',
    lg: 'w-3 h-3 border-[2px]',
    xl: 'w-4 h-4 border-[2.5px]',
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className={cn('relative inline-block shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-bold select-none border border-surface-700 bg-gradient-to-br from-primary-600 to-primary-800 text-white',
          sizeClasses[size],
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-surface-900',
            isOnline ? 'bg-accent-500' : 'bg-surface-700',
            statusSizeClasses[size],
          )}
        />
      )}
    </div>
  );
}
