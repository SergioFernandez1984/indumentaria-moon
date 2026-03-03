import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Ventas hoy
    const salesToday = await prisma.order.aggregate({
      where: {
        createdAt: { gte: today },
        status: { not: "cancelled" },
      },
      _sum: { total: true },
    });

    // 2. Órdenes pendientes
    const pendingOrders = await prisma.order.count({
      where: { status: "pending" },
    });

    // 3. Productos activos
    const activeProducts = await prisma.product.count({
      where: { isActive: true },
    });

    // 4. Clientes totales
    const totalCustomers = await prisma.customer.count();

    // 5. Últimas 5 órdenes
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
      },
    });

    return NextResponse.json({
      metrics: {
        salesToday: salesToday._sum.total || 0,
        pendingOrders,
        activeProducts,
        totalCustomers,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Error fetching stats" }, { status: 500 });
  }
}
