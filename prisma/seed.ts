import { categories, fillings, occasions, products } from './constants';
import { prisma } from './prisma-client';
import { hashSync } from 'bcrypt';

async function up() {
    await prisma.user.createMany({
        data: [
        {
            firstName: 'User',
            lastName: 'Test',
            email: 'user@test.ru',
            password: hashSync('111111', 10),
            role: 'USER',
        },
        {
            firstName: 'Admin',
            lastName: 'Test',
            email: 'admin@test.ru',
            password: hashSync('111111', 10),
            role: 'ADMIN',
        },
        ],
    });

    await prisma.category.createMany({
        data: categories,
    });

    await prisma.occasion.createMany({
        data: occasions,
    });

    await prisma.filling.createMany({
        data: fillings,
    });

    for (const product of products) {
        await prisma.product.create({
            data: {
            name: product.name,
            imageUrl: product.imageUrl,
            categoryId: product.categoryId,
            occasionId: product.occasionId,

            items: {
                create: [
                {
                    price: product.price, 
                    weight: null,
                },
                ],
            },
            },
        });
    }

    const cake1 = await prisma.product.create({
        data: {
            name: 'Торт с днём рождения',
            imageUrl: '/img/cake-birthday.jpg',
            categoryId: 1,
            occasionId: 2,
            items: {
            create: [
                {
                price: 2500,
                weight: 1000,
                fillings: {
                    connect: [{ id: 1 }, { id: 2 }],
                },
                },
                {
                price: 4000,
                weight: 2000,
                fillings: {
                    connect: [{ id: 1 }, { id: 2 }, { id: 3 }],
                },
                },
            ],
            },
        },
    });

    const cake2 = await prisma.product.create({
        data: {
            name: 'Торт люблю',
            imageUrl: '/img/cake-love.jpg',
            categoryId: 1,
            occasionId: 7,

            items: {
            create: [
                {
                price: 2700,
                weight: 1000,
                fillings: {
                    connect: [{ id: 3 }],
                },
                },
                {
                price: 4500,
                weight: 2000,
                fillings: {
                    connect: [{ id: 3 }, { id: 4 }],
                },
                },
            ],
            },
        },
    });

    const cake3 = await prisma.product.create({
        data: {
            name: 'Торт детский',
            imageUrl: '/img/cake-kids.jpg',
            categoryId: 2,
            occasionId: 2,

            items: {
            create: [
                {
                price: 2300,
                weight: 1000,
                fillings: {
                    connect: [{ id: 2 }],
                },
                },
                {
                price: 3800,
                weight: 2000,
                fillings: {
                    connect: [{ id: 2 }, { id: 5 }],
                },
                },
            ],
            },
        },
    });

    await prisma.cart.createMany({
        data: [
            {
                userId: 1,
                totalAmount: 0,
                token: '11111',
            },
            {
                userId: 2,
                totalAmount: 0,
                token: '222222',
            },
        ],
    });

    await prisma.cartItem.create({
        data: {
            productItemId: 1,
            cartId: 1,
            quantity: 2,
            fillingId: 2, 
        },
    });
}

async function down() {
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Category" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Filling" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "ProductItem" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Cart" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "CartItem" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Occasion" RESTART IDENTITY CASCADE`;
}

async function main() {
    try {
        await down();
        await up();
    } 
    catch (e) {
        console.error(e);
    }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });









































