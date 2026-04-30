import { prisma } from "@/prisma/prisma-client";
import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import { ProductForm } from "../product-form";

export default async function CreateProductPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const occasions = await prisma.occasion.findMany({
    orderBy: { name: "asc" },
  });

  const fillings = await prisma.filling.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="py-10 px-4 md:px-6">
      <ProductForm
        categories={categories}
        occasions={occasions}
        fillings={fillings}
      />
    </div>
  );
}