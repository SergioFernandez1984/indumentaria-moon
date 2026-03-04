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
      // Añadimos también effect: "background_removal" a la transformación para forzar el on-the-fly si el add-on demora
      cloudinaryConfig.transformation.push({ effect: "background_removal" });
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

    let finalUrl = result.secure_url;

    // Si se pidió optimización IA, inyectar el parámetro e_background_removal en la URL 
    if (aiOptimize) {
      finalUrl = finalUrl.replace("/upload/", "/upload/e_background_removal/");
      // Si Cloudinary la guarda como jpg y le removemos fondo, el navegador la procesa pero a veces se renderiza negra/blanca,
      // es mejor forzar la extensión a png en la URL para que cloudinary la convierta al vuelo
      finalUrl = finalUrl.replace(/\.[^/.]+$/, ".png");
    }

    const image = await prisma.productImage.create({
      data: {
        productId,
        url: finalUrl,
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
