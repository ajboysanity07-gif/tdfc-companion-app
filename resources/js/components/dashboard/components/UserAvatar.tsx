// 📄 5. resources/js/components/dashboard/components/UserAvatar.tsx
import { FC } from 'react';

interface UserAvatarProps {
  avatar: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-16 w-16',
  lg: 'h-20 w-20'
} as const;

export const UserAvatar: FC<UserAvatarProps> = ({ 
  avatar, 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const baseClasses = `${sizeClasses[size]} overflow-hidden rounded-full ring-2 ring-border ${className}`;
  
  if (avatar) {
    return (
      <div className={baseClasses}>
        <img 
          src={avatar} 
          alt={`${name}'s avatar`} 
          className="h-full w-full object-cover" 
        />
      </div>
    );
  }

  return (
    <div className={`${baseClasses} grid place-items-center bg-muted text-foreground`}>
      <span aria-hidden="true">👤</span>
      <span className="sr-only">{name}'s avatar placeholder</span>
    </div>
  );
};