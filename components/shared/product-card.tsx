import Link from 'next/link';
import React from 'react';
import { Title } from './title';
import { Button } from '../ui';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
    className?: string;
}

export const ProductCard: React.FC<Props> = ({ 
    id, 
    name, 
    price, 
    imageUrl, 
    className 
}) => {
    return (
        <Link href={`?product=${id}`} className="block group" scroll={false}>
            <div className={cn(
                'flex flex-col h-full p-3 bg-white rounded-2xl border border-gray-100',
                'hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1 transition-all duration-300',
                className
            )}>
                <div className="relative bg-gray-50 rounded-xl overflow-hidden aspect-square mb-3">
                    <img 
                        src={imageUrl} 
                        alt={name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                <div className="flex-1 flex flex-col">
                    <Title 
                        text={name} 
                        size="sm" 
                        className="font-bold leading-tight line-clamp-2 mb-2 min-h-10" 
                    />
                    
                    <div className="flex-1" />

                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
                        <span className="text-base md:text-lg font-bold text-gray-900">
                            {price} ₽
                        </span>

                        <Button 
                            variant="secondary" 
                            size="sm"
                            className={cn(
                                'flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2',
                                'bg-gray-100 hover:bg-primary hover:text-white transition-colors',
                                'rounded-xl'
                            )}
                        >
                            <Plus size={18} className="md:mr-1" />
                            <span className="hidden md:inline">В корзину</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    );
};