# Despliegue en Hetzner

El servidor `204.168.198.137` ya tiene Docker, Node, Nginx y Coolify/Traefik. Para esta tienda conviene usar Docker con volumen persistente.

## Volumen de imagenes

La app guarda imagenes en:

```txt
/app/public/uploads/productos
```

En produccion esa carpeta debe estar montada como volumen persistente. En `docker-compose.prod.yml` queda como:

```yaml
volumes:
  - moon_uploads:/app/public/uploads/productos
```

Esto evita depender de Cloudinary.

## Variables necesarias

```env
POSTGRES_PASSWORD=un-password-largo
AUTH_SECRET=un-secreto-largo
ADMIN_EMAIL=admin@email.com
ADMIN_PASSWORD=password-admin
NEXTAUTH_URL=https://tu-dominio.com
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
MP_ACCESS_TOKEN=
RESEND_API_KEY=
```

Mercado Pago y Resend pueden quedar vacios si primero se opera por transferencia y contacto manual.

## Recomendacion

El disco del servidor esta cerca del limite. Antes de cargar muchas imagenes conviene liberar espacio o ampliar disco.
