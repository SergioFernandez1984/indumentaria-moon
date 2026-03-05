"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import CarritoIcon from "@/components/CarritoIcon";

export default function NavbarModern() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="sticky top-0 z-50 glass-effect border-b border-white/10"
        >
            <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/"
                    className="relative flex items-center justify-center w-56 h-20 overflow-hidden"
                >
                    <Image
                        src="/logo.png"
                        alt="Moon Indumentaria Logo"
                        fill
                        className="object-contain scale-[1.7] mix-blend-screen drop-shadow-md"
                        priority
                    />
                </motion.a>

                <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
                    <motion.a
                        whileHover={{ y: -2, color: "#fff" }}
                        transition={{ type: "spring", stiffness: 300 }}
                        href="/productos"
                        className="transition-colors"
                    >
                        Colección
                    </motion.a>
                    <motion.a
                        whileHover={{ y: -2, color: "#fff" }}
                        transition={{ type: "spring", stiffness: 300 }}
                        href="/productos"
                        className="transition-colors"
                    >
                        Novedades
                    </motion.a>
                </nav>

                <div className="flex items-center gap-4">
                    <CarritoIcon />
                </div>
            </div>
        </motion.header>
    );
}
