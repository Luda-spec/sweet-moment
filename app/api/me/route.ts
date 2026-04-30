import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import { auth } from "@/app/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(null, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    if (!user) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json({
      id: user.id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
  } catch (error) {
    console.error("ME API ERROR:", error);

    return NextResponse.json(null, { status: 500 });
  }
}