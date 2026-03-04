"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ProductImage {
    id: string;
    url: string;
    altText: string | null;
}

interface ProductGalleryProps {
    images: ProductImage[];
    productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-[3/4] bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-8xl shadow-sm border border-neutral-200 dark:border-zinc-700">
                👗
            </div>
        );
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Imagen Principal con Zoom */}
            <div
                ref={containerRef}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 shadow-sm border border-neutral-200 dark:border-zinc-700 cursor-crosshair group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleMouseMove}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full relative"
                    >
                        <img
                            src={images[activeIndex].url}
                            alt={images[activeIndex].altText ?? productName}
                            className={`w-full h-full object-cover transition-transform duration-200 ease-out`}
                            style={{
                                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                                transform: isHovered ? "scale(2)" : "scale(1)",
                            }}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                        <button
                            key={img.id}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${idx === activeIndex
                                    ? "border-black dark:border-white opacity-100"
                                    : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                        >
                            <img
                                src={img.url}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
