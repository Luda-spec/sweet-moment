'use client';

import { cn } from "@/lib/utils";
import { useCategoryStore } from "@/store/category";
import React from "react";
import { Category } from "@prisma/client";

interface Props {
    items: Category[];
    className?: string;
}

export const Categories: React.FC<Props> = ({ items, className }) => {
    const categoryActiveId = useCategoryStore((state) => state.activeId);
    
    return (
        <div className={cn('overflow-x-auto scrollbar-hide', className)}>
            <div className="inline-flex gap-2 bg-gray-50 p-2 rounded-2xl whitespace-nowrap">
                {items.map(({name, id}, index) => (
                    <a 
                        className={cn(
                            'flex items-center font-bold h-10 md:h-11 rounded-2xl px-4 md:px-5 transition-all duration-300',
                            categoryActiveId == id 
                                ? 'bg-white shadow-md shadow-gray-200 text-primary' 
                                : 'text-gray-600 hover:text-gray-900'
                        )} 
                        href={`/#${name}`}
                        key={index}
                    >
                        {name}
                    </a>
                ))}
            </div>
        </div>
    );
};