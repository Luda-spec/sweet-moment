import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const occasions = await prisma.occasion.findMany();

  return NextResponse.json(occasions);
}