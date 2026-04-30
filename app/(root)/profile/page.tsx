'use client';

import React, { useEffect, useState } from "react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui";
import { toast } from "sonner"; 
import { useUserStore } from "@/store/user";

export default function ProfilePage() {
    const user = useUserStore((state) => state.user);
    const fetchUser = useUserStore((state) => state.fetchUser);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const handleSave = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            toast.error("Заполните имя и фамилию", {
                position: "top-right",
                duration: 3000,
            });
            return;
        }

        setIsSaving(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    firstName: firstName.trim(), 
                    lastName: lastName.trim() 
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Ошибка сохранения");
            }

            await fetchUser(); 

            toast.success("Профиль успешно обновлён!", {
                position: "top-right",
                duration: 3000,
            });

        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Произошла ошибка";

            toast.error(message, {
                position: "top-right",
                duration: 4000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Container className="py-10 px-4 md:px-0">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-black mb-6">Профиль</h1>

                <div className="bg-white border rounded-2xl p-6 space-y-5 shadow-sm">

                    <div>
                        <label className="text-sm text-gray-500 font-medium">Имя</label>
                        <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full mt-1 h-11 px-4 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition"
                            placeholder="Введите имя"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-500 font-medium">Фамилия</label>
                        <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full mt-1 h-11 px-4 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition"
                            placeholder="Введите фамилию"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-500 font-medium">Email</label>
                        <input
                            value={email}
                            disabled
                            className="w-full mt-1 h-11 px-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl transition disabled:opacity-50 cursor-pointer mt-2"
                    >
                        {isSaving ? "Сохранение..." : "Сохранить изменения"}
                    </Button>

                </div>
            </div>
        </Container>
    );
}
