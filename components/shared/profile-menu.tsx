'use client';

import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui";
import {
    User,
    ChevronDown,
    LogOut,
    Package,
    Settings,
    UserCircle,
    LayoutGrid 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user";

interface Props {
    className?: string;
}

export const ProfileMenu: React.FC<Props> = ({ className }) => {
    const user = useUserStore((s) => s.user);
    const isLoading = useUserStore((s) => s.isLoading);

    const { setIsOpen, setMode } = useAuthStore();
    const router = useRouter();

    const isAuthenticated = !!user;
    const isAdmin = user?.role === "ADMIN";

    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const openLogin = () => {
        setMode("login");
        setIsOpen(true);
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });

        setConfirmOpen(false);
        setOpen(false);

        toast.success("Вы вышли из аккаунта");
    };

    if (isLoading) {
        return (
            <div className="h-10 w-10 bg-gray-100 rounded-xl animate-pulse" />
        );
    }

    return (
        <div ref={ref} className={cn("relative", className)}>

            {isAuthenticated ? (
                <>
                    <button
                        onClick={() => setOpen(v => !v)}
                        className="flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-gray-100 cursor-pointer"
                    >
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                                {user?.firstName?.[0]}
                                {user?.lastName?.[0]}
                            </span>
                        </div>

                        <ChevronDown
                            size={16}
                            className={cn(
                                "transition-transform",
                                open && "rotate-180"
                            )}
                        />
                    </button>

                    {open && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border z-[100]">

                            <div className="p-4 border-b bg-gray-50">
                                <p className="font-semibold">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.email}
                                </p>
                            </div>

                            <div className="p-2">

                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        router.push("/");
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer"
                                >
                                    <LayoutGrid size={18} />
                                    Каталог
                                </button>

                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        router.push("/profile");
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer"
                                >
                                    <UserCircle size={18} />
                                    Профиль
                                </button>

                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        router.push("/orders");
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer"
                                >
                                    <Package size={18} />
                                    Заказы
                                </button>

                                {isAdmin && (
                                    <button
                                        onClick={() => {
                                            setOpen(false);
                                            router.push("/admin");
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-primary cursor-pointer"
                                    >
                                        <Settings size={18} />
                                        Админ-панель
                                    </button>
                                )}

                            </div>

                            <div className="p-2 border-t">
                                <button
                                    onClick={() => {
                                        setConfirmOpen(true);
                                        setOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer"
                                >
                                    <LogOut size={18} />
                                    Выйти
                                </button>
                            </div>

                        </div>
                    )}
                </>
            ) : (
                <Button
                    variant="outline"
                    onClick={openLogin}
                    className="h-10 w-10 p-0 cursor-pointer"
                >
                    <User size={20} />
                </Button>
            )}

            {confirmOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">

                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">

                        <h3 className="text-lg font-bold mb-2">
                            Вы уверены?
                        </h3>

                        <p className="text-sm text-gray-500 mb-5">
                            Вы точно хотите выйти из аккаунта?
                        </p>

                        <div className="flex gap-3">

                            <Button
                                variant="outline"
                                className="flex-1 cursor-pointer"
                                onClick={() => setConfirmOpen(false)}
                            >
                                Отмена
                            </Button>

                            <Button
                                className="flex-1 bg-primary text-white cursor-pointer"
                                onClick={handleLogout}
                            >
                                Выйти
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};