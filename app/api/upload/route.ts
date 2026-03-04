import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;

    const aiOptimize = formData.get("aiOptimize") === "true";
    const isPrimaryStr = formData.get("isPrimary");
    const isPrimary = isPrimaryStr ? isPrimaryStr === "true" : true;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    // Convertir el archivo a arrayBuffer y luego a Buffer 
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Configurar subida a Cloudinary
    const cloudinaryConfig: any = {
      folder: "indumentaria-moon/productos",
      transformation: [{ width: 800, height: 1000, crop: "fill" }],
    };

    if (aiOptimize) {
      cloudinaryConfig.background_removal = "cloudinary_ai";
    }

    // Subir a Cloudinary usando un stream para mayor eficiencia con archivos grandes 
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        cloudinaryConfig,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    }) as any;

    // Guardar la URL en la base de datos 
    const { prisma } = await import("@/lib/prisma");

    const image = await prisma.productImage.create({
      data: {
        productId,
        url: result.secure_url,
        altText: file.name,
        isPrimary: isPrimary,
        sortOrder: 0,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 }
    );
  }
} 
