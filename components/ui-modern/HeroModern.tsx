"use client";

import { motion } from "framer-motion";

export default function HeroModern() {
    return (
        <section className="relative w-full min-h-[80vh] flex flex-col items-center justify-center overflow-hidden py-20 px-4">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-background overflow-hidden -z-10">
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-screen" />
            </div>

            <div className="max-w-4xl mx-auto text-center z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="inline-block mb-4 px-4 py-1.5 rounded-full border border-white/10 glass-card text-sm font-medium text-gray-300"
                >
                    ✨ Temporada 2026 Ya Disponible
                </motion.div>

                <motion.h1
                    className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                >
                    El estilo del <br /> mañana hoy.
                </motion.h1>

                <motion.p
                    className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-light"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    Descubrí las últimas tendencias de Indumentaria Moon y marcá la diferencia.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="flex justify-center"
                >
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href="/productos"
                        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-white/10 rounded-full overflow-hidden transition-all border border-white/20 hover:bg-white/20 backdrop-blur-md shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Ver Colección
                            <motion.span
                                className="inline-block"
                                initial={{ x: 0 }}
                                whileHover={{ x: 5 }}
                            >
                                →
                            </motion.span>
                        </span>
                    </motion.a>
                </motion.div>
            </div>

            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10" />
        </section>
    );
}
