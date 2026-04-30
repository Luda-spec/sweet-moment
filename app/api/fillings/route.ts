import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function GET() {
  try {
    const fillings = await prisma.filling.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(fillings);
  } catch (error) {
    console.error('Fillings fetch error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}