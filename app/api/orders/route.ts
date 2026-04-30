import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { PaymentMethod, OrderStatus } from '@prisma/client';
import { auth } from '@/app/auth';

type OrderItemInput = {
  productId: number;
  quantity: number;
  price: number;
  name: string;
  imageUrl: string;
  fillingName?: string;
  weight?: number;
};

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    const userId = Number(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
    }
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();

    const totalAmount = Number(body.totalAmount);
    const deliveryPrice = body.deliveryPrice != null ? Number(body.deliveryPrice) : null;
    const items: OrderItemInput[] = Array.isArray(body.items) ? body.items : [];
    const paymentMethod = body.paymentMethod === 'CARD' ? PaymentMethod.CARD : PaymentMethod.CASH;

    if (!items.length || isNaN(totalAmount) || totalAmount <= 0) {
      return NextResponse.json({ error: 'Некорректные данные заказа' }, { status: 400 });
    }

    if (!body.fullName || !body.email || !body.phone || !body.address || !body.deliveryDate || !body.deliveryTime) {
      return NextResponse.json({ error: 'Заполните дату, время и все обязательные поля' }, { status: 400 });
    }

    const userIdRaw = session?.user?.id;
    const userId = userIdRaw && !isNaN(Number(userIdRaw)) ? Number(userIdRaw) : null;

    const safeItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      price: Number(item.price),
      name: String(item.name),
      imageUrl: String(item.imageUrl),
      fillingName: item.fillingName ? String(item.fillingName) : null,
      weight: item.weight ? Number(item.weight) : null,
    }));

    const deliveryDate = String(body.deliveryDate);
    const deliveryTime = String(body.deliveryTime);

    const order = await prisma.order.create({
      data: {
        userId,
        token: crypto.randomUUID(),
        totalAmount,
        deliveryPrice,
        paymentMethod,
        items: safeItems,
        fullName: String(body.fullName),
        email: String(body.email),
        phone: String(body.phone),
        address: String(body.address),
        deliveryDate,
        deliveryTime,
        comment: body.comment ? String(body.comment) : null,
        status: OrderStatus.PENDING, 
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}