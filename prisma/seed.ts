import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando carga de datos de prueba...')

    // Limpiar base de datos (Opcional, tené cuidado en PROD)
    // await prisma.orderItem.deleteMany()
    // await prisma.order.deleteMany()
    // await prisma.productImage.deleteMany()
    // await prisma.productVariant.deleteMany()
    // await prisma.product.deleteMany()
    // await prisma.category.deleteMany()

    // 1. Crear Categorías
    const remeras = await prisma.category.create({
        data: {
            name: 'Remeras',
            slug: 'remeras',
        },
    })

    const hoodies = await prisma.category.create({
        data: {
            name: 'Hoodies',
            slug: 'hoodies',
        },
    })

    // 2. Crear Productos con sus Variantes e Imágenes
    const product1 = await prisma.product.create({
        data: {
            name: 'Remera Oversize Basic',
            slug: 'remera-oversize-basic',
            description: 'Hecha con 100% algodón orgánico, calce oversize perfecto.',
            basePrice: 15000,
            categoryId: remeras.id,
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop',
                        altText: 'Remera Blanca Frente',
                        isPrimary: true,
                        sortOrder: 1,
                    }
                ]
            },
            variants: {
                create: [
                    { size: 'M', color: 'Blanco', stock: 10 },
                    { size: 'L', color: 'Blanco', stock: 15 },
                    { size: 'L', color: 'Negro', stock: 5 },
                ]
            }
        }
    })

    const product2 = await prisma.product.create({
        data: {
            name: 'Hoodie Moon Essential',
            slug: 'hoodie-moon-essential',
            description: 'El clásico buzo canguro, rústico invisible peinado.',
            basePrice: 35000,
            salePrice: 29990,
            categoryId: hoodies.id,
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
                        altText: 'Hoodie Moon',
                        isPrimary: true,
                        sortOrder: 1,
                    }
                ]
            },
            variants: {
                create: [
                    { size: 'S', color: 'Gris', stock: 5 },
                    { size: 'M', color: 'Gris', stock: 8 },
                ]
            }
        }
    })

    console.log(`✅ Se crearon las categorías y los productos con éxito.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
