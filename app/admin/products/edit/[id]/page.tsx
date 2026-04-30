import { prisma } from "@/prisma/prisma-client";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/auth";
import { ProductForm } from "../../product-form";

export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/");
  }

  const { id } = await params;
  const productId = Number(id);
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      items: {
        include: {
          fillings: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
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
        initialData={{
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          occasionId: product.occasionId,
          items: product.items,
        }}
        isEdit
      />
    </div>
  );
}