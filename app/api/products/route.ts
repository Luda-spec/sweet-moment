import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        occasion: true,
        items: true, 
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка загрузки товаров' }, { status: 500 });
  }
}