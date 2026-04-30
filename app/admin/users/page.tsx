import { prisma } from "@/prisma/prisma-client";
import { UserCard } from "./user-card";
import { UserCheck } from "lucide-react";
import { auth } from "@/app/auth";

export default async function AdminUsersPage() {
  const session = await auth();
  const currentAdmin = await prisma.user.findUnique({
    where: { email: session?.user?.email },
    select: { id: true },
  });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Пользователи</h1>
        <p className="text-gray-500 mt-1">Управление доступом и ролями</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((user) => (
          <UserCard key={user.id} user={user} currentUserId={currentAdmin?.id} />
        ))}
      </div>

      {users.length === 0 && (
        <div className="col-span-full text-center py-16 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck size={32} className="text-gray-400" />
          </div>
          <p className="text-lg font-medium mb-1">Пользователей пока нет</p>
          <p className="text-sm">Зарегистрированные пользователи появятся здесь</p>
        </div>
      )}
    </div>
  );
}