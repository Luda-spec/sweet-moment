import { cn } from "@/lib/utils";
import React from "react";
import { Container } from "./container";
import { Categories } from "./categories";
import { SortPopup } from "./sort-popup";
import { Category } from "@prisma/client";

interface Props {
    categories: Category[];
    className?: string;
}

export const TopBar: React.FC<Props> = ({ categories, className }) => {
    return (
        <div className={cn(
            'sticky top-0 bg-white/95 backdrop-blur-md py-3 md:py-5 shadow-lg shadow-black/5 z-10 ', 
            className
        )}>
           <Container>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    
                    <Categories items={categories} className="w-full md:w-auto" />
                    
                    <div className=" md:ml-auto">
                        <SortPopup />
                    </div>
                </div>
           </Container>
        </div>
    );
};