'use client';

import React from 'react';
import { useIntersection } from 'react-use';
import { Title } from './title';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';
import { useCategoryStore } from '@/store/category';
import { Prisma } from '@prisma/client';

type ProductWithItems = Prisma.ProductGetPayload<{
  include: {
    items: true;
  };
}>;

interface Props {
    title: string;
    items: ProductWithItems[];
    className?: string;
    listClassName?: string;
    categoryId: number;
}

export const ProductsGroupList: React.FC<Props> = ({ 
    title,
    items,
    listClassName,
    categoryId,
    className, 
}) => {
    const setActiveCategoryId = useCategoryStore((state) => state.setActiveId);
    const intersectionRef = React.useRef<HTMLDivElement>(null);
    const intersection = useIntersection(intersectionRef as React.RefObject<HTMLElement>, {
        threshold: 0.4,
    });

    React.useEffect(() => {
        if (intersection?.isIntersecting) {
            setActiveCategoryId(categoryId);
        }
    }, [categoryId, intersection?.isIntersecting, title]);

    return (
        <div className={cn('scroll-mt-20', className)} id={title} ref={intersectionRef}>
            <Title 
                text={title} 
                size="md" 
                className="font-extrabold mb-3 md:mb-6 px-2 text-md md:text-3xl" 
            />
            
            <div className={cn(
                'grid gap-3 md:gap-5',
                'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                listClassName
            )}>
                {items.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        imageUrl={product.imageUrl}
                        price={product.items[0]?.price || 0}
                    />
                ))}
            </div>
        </div>
    );
};