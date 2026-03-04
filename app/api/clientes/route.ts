import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const clientes = await prisma.customer.findMany({
            include: {
                orders: {
                    select: {
                        total: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const parsedClientes = clientes.map((c) => {
            const cantidadOrdenes = c.orders.length;
            const totalGastado = c.orders.reduce((sum, order) => sum + order.total, 0);

            return {
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone || "No especificado",
                createdAt: c.createdAt,
                cantidadOrdenes,
                totalGastado,
            };
        });

        return NextResponse.json(parsedClientes);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        return NextResponse.json(
            { error: "Error al obtener clientes" },
            { status: 500 }
        );
    }
}
