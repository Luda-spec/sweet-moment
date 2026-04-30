'use client';

import { cn } from "@/lib/utils";
import { ArrowUpDown, ChevronDown, Check } from "lucide-react";
import React, { useState, useRef } from "react";
import { useClickAway } from "react-use";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
    className?: string;
}

export const SortPopup: React.FC<Props> = ({ className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const ref = useRef<HTMLDivElement>(null);

    const currentSort = searchParams.get('sortBy') || 'asc';

    useClickAway(ref, () => {
        setIsOpen(false);
    });

    const handleSortChange = (type: 'asc' | 'desc') => {
        const params = new URLSearchParams(window.location.search);
        params.set('sortBy', type);
        router.push(`?${params.toString()}`, { scroll: false });
        setIsOpen(false);
    };

    return (
        <div ref={ref} className={cn('relative inline-block text-left', className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'inline-flex items-center gap-2 bg-gray-50 px-4 h-10 md:h-[52px] rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent',
                    isOpen && 'bg-gray-100 border-gray-200'
                )}
            >
                <ArrowUpDown size={16} className="text-gray-500" />
                <span className="hidden md:inline text-sm font-medium text-gray-500">Сортировка:</span>
                <b className={cn('text-sm', currentSort === 'asc' ? 'text-primary' : 'text-gray-900')}>
                    {currentSort === 'asc' ? 'дешевле' : 'дороже'}
                </b>
                <ChevronDown size={16} className={cn('text-gray-400 transition-transform duration-300', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
                <div className="absolute left-0 md:right-0 md:left-auto mt-2 w-auto min-w-[150px] bg-white rounded-xl shadow-xl border border-gray-100 z-15 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                    <button
                        onClick={() => handleSortChange('asc')}
                        className={cn(
                            'w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between whitespace-nowrap',
                            currentSort === 'asc' ? 'text-primary font-bold bg-gray-50' : 'text-gray-700'
                        )}
                    >
                        По возрастанию
                        {currentSort === 'asc' && <Check size={16} />}
                    </button>
                    
                    <button
                        onClick={() => handleSortChange('desc')}
                        className={cn(
                            'w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between whitespace-nowrap',
                            currentSort === 'desc' ? 'text-primary font-bold bg-gray-50' : 'text-gray-700'
                        )}
                    >
                        По убыванию
                        {currentSort === 'desc' && <Check size={16} />}
                    </button>
                </div>
            )}
        </div>
    );
};