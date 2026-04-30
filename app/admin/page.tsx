import { prisma } from "@/prisma/prisma-client";
import Link from "next/link";
import { ShoppingBag, Package, Users } from "lucide-react";

export default async function AdminDashboard() {
  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();
  const usersCount = await prisma.user.count();

  const cards = [
    {
      title: "Товары",
      count: productsCount,
      icon: <ShoppingBag size={24} />,
      href: "/admin/products",
      color: "text-primary",
      iconBg: "bg-purple-100",
    },
    {
      title: "Заказы",
      count: ordersCount,
      icon: <Package size={24} />,
      href: "/admin/orders",
      color: "text-primary",
      iconBg: "bg-purple-100",
    },
    {
      title: "Пользователи",
      count: usersCount,
      icon: <Users size={24} />,
      href: "/admin/users",
      color: "text-primary",
      iconBg: "bg-purple-100",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900">Управление</h2>
        <p className="text-gray-500 mt-2">Добро пожаловать в панель администратора</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        {cards.map((card, idx) => (
          <Link
            key={idx}
            href={card.href}
            className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer w-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.iconBg}`}>
                <div className={card.color}>{card.icon}</div>
              </div>
              <span className="text-2xl font-bold text-gray-900 group-hover:text-primary transition">
                {card.count}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 text-center">
              {card.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}