import { redirect } from "next/navigation";
import { prisma } from "@/prisma/prisma-client";
import { auth } from "../auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      redirect("/");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      redirect("/");
    }
  } catch (error) {
    console.warn("Admin layout auth check failed:", error);
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}