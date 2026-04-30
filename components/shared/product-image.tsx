import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  className?: string;
  imageUrl: string;
}

export const ProductImage: React.FC<Props> = ({ imageUrl, className }) => {

  return (
    <div className={cn('flex items-center justify-center relative', className)}>
      <img
        src={imageUrl}
        alt="Product"
        className="transition-all duration-300 rounded-xl w-[320px] h-[400px]"
      />
    </div>
  );
};