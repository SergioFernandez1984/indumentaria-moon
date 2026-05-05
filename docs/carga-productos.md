# Carga masiva de productos

El admin permite importar productos desde una planilla CSV en `/dashboard/productos`.

## Formato

Columnas soportadas:

```csv
name,description,basePrice,salePrice,category,sizes,colors,stock,imageUrls
"Remera basica","Algodon peinado, calce regular",15000,,Remeras,"S|M|L","Blanco|Negro",5,"https://...jpg|https://...jpg"
```

Reglas:

- `name` y `basePrice` son obligatorios.
- `sizes`, `colors` e `imageUrls` aceptan varios valores separados por `|`.
- Si no se cargan talles o colores, el sistema crea una variante `Unico / Unico`.
- `stock` se aplica a cada combinacion de talle y color.
- La primera imagen de `imageUrls` queda como imagen principal.

## Automatizacion recomendada

Cuando este definido como publica los productos tu esposa, conviene elegir una de estas rutas:

1. Si ya tiene flyers con texto, usar el bloque `Importar desde flyers` en `/dashboard/productos`.
2. El sistema guarda cada imagen en `public/uploads/productos`, lee el texto del flyer con OCR local y arma una planilla CSV.
3. Revisar la planilla generada, corregir lo que haga falta y presionar `Importar productos`.
4. Este flujo no usa APIs pagas. La precision depende de que el texto del flyer sea legible.

La API disponible para automatizar es `POST /api/productos/import`.
La API para analizar una imagen individual es `POST /api/productos/import/imagen`.

## Importante sobre hosting

Guardar imagenes en el propio servidor es gratis, pero el servidor debe conservar archivos. Si se usa Vercel u otro hosting sin disco persistente, las imagenes pueden perderse al redeployar. Para mantener costo bajo conviene usar un VPS, Coolify, Railway con volumen persistente, o cualquier hosting Node con carpeta persistente.
