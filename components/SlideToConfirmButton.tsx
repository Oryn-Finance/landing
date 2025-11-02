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

  const [containerWidth, setContainerWidth] = useState(300);
  const thumbSize = 48; // w-12 = 48px
  const thumbPadding = 8; // left-2 = 8px
  const maxDrag = containerWidth - thumbSize - (thumbPadding * 2); // Maximum drag distance

  const opacity = useTransform(x, [0, maxDrag], [0.3, 1]);
  const scale = useTransform(x, [0, maxDrag], [0.8, 1]);

  useEffect(() => {
    // Calculate actual container width
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setContainerWidth(width);
    }
  }, []);

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

  // Progress width should match the slider position exactly
  // Thumb left edge is at: thumbPadding (8px) + x
  // Fill should extend to the right edge of the thumb: thumbPadding + x + thumbSize
  const progressWidthPx = useTransform(
    x,
    [0, maxDrag],
    [
      thumbPadding + thumbSize, // When x=0, fill extends to right edge of initial thumb position
      thumbPadding + maxDrag + thumbSize, // When x=maxDrag, fill extends to right edge of final thumb position
    ],
    {
      clamp: false,
    }
  );

  // Convert to pixels as a string
  const progressWidthString = useTransform(progressWidthPx, (w) => `${w}px`);

  if (isLoading) {
    return (
      <div
        className={`relative w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center ${className}`}
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
      className={`relative w-[95%] h-16 bg-gray-200 rounded-full overflow-hidden ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${className}`}
    >
      {/* Filled progress background - purple-blue gradient on left side */}
      <motion.div
        style={{
          width: progressWidthString,
        }}
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
      />

      {/* Background with arrow */}
      <div className="absolute inset-0 flex items-center justify-end pr-4 z-10">
        <motion.div
          style={{ opacity }}
          className="text-gray-700 text-sm font-medium"
        >
          {confirmText}
        </motion.div>
        <motion.svg
          style={{ opacity, scale }}
          className="w-6 h-6 text-gray-700 ml-2"
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

      {/* Draggable thumb - always visible */}
      <motion.div
        drag={disabled ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`absolute top-2 left-2 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-20 ${isDragging ? "shadow-xl" : ""
          }`}
        whileDrag={{ scale: 1.1 }}
      >
        {/* Arrow icon in the thumb */}
        <svg
          className="w-5 h-5 text-white"
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
    </div>
  );
};

export default SlideToConfirmButton;
