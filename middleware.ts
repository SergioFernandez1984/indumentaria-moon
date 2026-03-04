import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");

    if (isDashboardRoute && !isLoggedIn) {
        // Obtenemos el dominio real que usó el navegador (ya sea sslip.io o indumentariamoon.com.ar)
        const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        return NextResponse.redirect(new URL("/login", `${protocol}://${host}`));
    }
    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
