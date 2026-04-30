'use client';

import { cn } from "@/lib/utils";
import React from "react";
import { Container } from "./container";
import Image from "next/image";
import { Button } from "../ui";
import { ShoppingCart } from "lucide-react";
import { SearchInput } from "./search-input";
import { useCartStore, useCartTotalPrice, useCartTotalCount } from "@/store/cart";
import { ProfileMenu } from "./profile-menu";

interface Props {
    className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
    const totalPrice = useCartTotalPrice();
    const totalCount = useCartTotalCount();
    const setCartOpen = useCartStore((s) => s.setIsOpen);

    return (
        <header className={cn("border-b bg-white z-50", className)}>
            <Container className="py-4 md:py-6 px-4 md:px-6">

                <div className="hidden md:flex items-center justify-between gap-6">

                    <div className="flex items-center gap-3">
                        <Image src="../../logo.svg" alt="Logo" width={40} height={40} />
                        <div>
                            <h1 className="text-2xl font-black uppercase">
                                Sweet moment
                            </h1>
                            <p className="text-xs text-gray-400">
                                Где каждый повод становится особенным
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-2xl">
                        <SearchInput />
                    </div>

                    <div className="flex items-center gap-3">

                        <ProfileMenu />

                        <Button
                            onClick={() => setCartOpen(true)}
                            className="bg-primary text-white h-10 px-4 rounded-xl"
                        >
                            <b className="mr-2">{totalPrice} ₽ |</b>
                            <ShoppingCart size={18} />
                            <b className="ml-1">{totalCount}</b>
                        </Button>

                    </div>
                </div>

                <div className="md:hidden">

                    <div className="flex items-center justify-between mb-3">

                        <div className="flex items-center gap-2">
                            <Image src="../../logo.svg" alt="Logo" width={32} height={32} />
                            <div>
                                <h1 className="text-base font-black uppercase">
                                    Sweet moment
                                </h1>
                                <p className="text-[10px] text-gray-400">
                                    Где каждый повод становится особенным
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setCartOpen(true)}
                                className="bg-primary h-9 px-3 rounded-xl"
                            >
                                <b className="text-xs">{totalPrice}₽ |</b>
                                <ShoppingCart size={16} />
                                <b className="text-xs ml-1">{totalCount}</b>
                            </Button>

                            <ProfileMenu />
                        </div>
                    </div>

                    <SearchInput />
                </div>

            </Container>
        </header>
    );
};