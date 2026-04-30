import { Container, Filters, Title, TopBar, ChooseCakeModal, ChooseProductModal } from "@/components/shared";
import { ProductsGroupList } from "@/components/shared/products-group-list";
import { WheelButton } from "@/components/shared/wheel-button";
import { getHomePageData } from "@/hooks/get-products";



export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { categories, selectedProduct, isCake } = await getHomePageData(searchParams);

  return (
    <>
      <Container className="mt-6 ml-5 md:mt-10 md:ml-auto">
        <Title 
          text="Все товары" 
          size="lg" 
          className="font-extrabold text-2xl md:text-4xl" 
        />
      </Container>

      <TopBar categories={categories}/>

      <Container className="mt-6 md:mt-10 pb-14">
        <div className="flex flex-col md:flex-row gap-6 md:gap-20">
          <div className="w-full md:w-[250px] md:shrink-0">
            <Filters/>
          </div>
          <div className="flex-1">
            <div className="flex flex-col gap-12 md:gap-16">
              {categories.map((category) => (
                <ProductsGroupList
                  key={category.id}
                  title={category.name}
                  categoryId={category.id}
                  items={category.products}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>

      {selectedProduct && isCake && <ChooseCakeModal product={selectedProduct} />}
      {selectedProduct && !isCake && <ChooseProductModal product={selectedProduct} />}

      <WheelButton />
    </>
  );
}