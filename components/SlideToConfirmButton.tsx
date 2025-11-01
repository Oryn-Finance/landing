"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface SlideToConfirmButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  confirmText?: string;
  className?: string;
}

const SlideToConfirmButton: React.FC<SlideToConfirmButtonProps> = ({
  onConfirm,
  disabled = false,
  isLoading = false,
  loadingText = "Processing...",
  confirmText = "Slide to confirm",
  className = "",
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const containerWidth = 300; // Fixed width for the slide container
  const thumbSize = 60; // Size of the draggable circle
  const maxDrag = containerWidth - thumbSize - 8; // Maximum drag distance

  const opacity = useTransform(x, [0, maxDrag], [0.3, 1]);
  const scale = useTransform(x, [0, maxDrag], [0.8, 1]);

  useEffect(() => {
    if (isConfirmed) {
      x.set(maxDrag);
    } else {
      x.set(0);
    }
  }, [isConfirmed, x, maxDrag]);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } }
  ) => {
    setIsDragging(false);

    if (info.offset.x >= maxDrag * 0.8) {
      // User dragged far enough to confirm
      setIsConfirmed(true);
      setTimeout(() => {
        onConfirm();
        // Reset after a short delay
        setTimeout(() => {
          setIsConfirmed(false);
          x.set(0);
        }, 1000);
      }, 300);
    } else {
      // Snap back to start
      x.set(0);
    }
  };

  const handleDragStart = () => {
    if (!disabled && !isLoading) {
      setIsDragging(true);
    }
  };

  const progressWidth = useTransform(x, [0, maxDrag], ["0%", "100%"]);

  if (isLoading) {
    return (
      <div
        className={`relative w-full h-16 bg-gray-900 rounded-2xl flex items-center justify-center ${className}`}
      >
        <div className="flex items-center justify-center text-white">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
          {loadingText}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-[95%] h-16 bg-gray-900 rounded-full overflow-hidden ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      {/* Background with arrow */}
      <div className="absolute inset-0 flex items-center justify-end pr-4">
        <motion.div
          style={{ opacity }}
          className="text-white text-sm font-medium"
        >
          {confirmText}
        </motion.div>
        <motion.svg
          style={{ opacity, scale }}
          className="w-6 h-6 text-white ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </motion.svg>
      </div>

      {/* Draggable thumb */}
      <motion.div
        drag={disabled ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`absolute top-2 left-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing ${
          isDragging ? "shadow-xl" : ""
        }`}
        whileDrag={{ scale: 1.1 }}
      >
        {/* Arrow icon in the thumb */}
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </motion.div>

      {/* Progress background */}
      <motion.div
        style={{
          width: progressWidth,
        }}
        className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl"
      />
    </div>
  );
};

export default SlideToConfirmButton;
