import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import { auth } from "@/app/auth";

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { firstName, lastName } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: "Имя и фамилия обязательны" },
        { status: 400 }
      );
    }

    const userId = Number(session.user.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Некорректный ID пользователя" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id.toString(),
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}